/**
 * Chat router implementation using Vercel AI SDK and Permit.io for security
 */
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { logger } from "@repo/logs";
import { type Message } from "ai";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import { chatService } from "./chat.service";
import { logAccessAttempt } from "@repo/permit";
import { HTTPException } from "hono/http-exception";
import { promptService } from "./services";

// Define interface for context variables
declare module "hono" {
  interface ContextVariableMap {
    permitContext: {
      userId: string;
      filters?: Record<string, any>;
      classification?: string;
    };
  }
}

/**
 * Middleware that checks if user has permissions to use chat functionality
 */
function permitChatMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    try {
      const userId = getUserId(c);
      logger.debug(`Checking chat access for user ${userId}`);
      
      // Log access attempt
      await logAccessAttempt(userId, "access", "chat", true);
      
      // Create custom context property for permission filters
      c.set("permitContext", { userId, filters: {} });
      
      await next();
    } catch (error) {
      logger.error(`Chat access error:`, error);
      return c.json({ 
        error: "Authorization error",
        message: error instanceof Error ? error.message : "Access denied"
      }, 401);
    }
  };
}

/**
 * Middleware to classify and filter prompts based on intent and user permissions
 */
async function promptClassifierMiddleware(c: any, next: () => Promise<void>) {
  try {
    // Get user ID from auth context
    const userId = getUserId(c);
    
    // Parse the request body
    const body = await c.req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new HTTPException(400, { message: "Invalid or empty messages" });
    }
    
    // Classify the prompt using our service
    const classificationResult = await promptService.classifyPrompt(userId, messages);
    
    if (!classificationResult.allowed) {
      logger.warn(`Prompt rejected for user ${userId}: ${classificationResult.reason}`);
      return c.json({ 
        error: "Prompt rejected", 
        message: classificationResult.reason || "Your request cannot be processed"
      }, 403);
    }
    
    // Attach classification data to context for downstream usage
    const permitContext = c.get("permitContext") || { userId };
    c.set("permitContext", {
      ...permitContext,
      classification: classificationResult.classification,
      filters: classificationResult.filters || {}
    });
    
    // Log successful classification
    logger.info(`Prompt classified as '${classificationResult.classification}' for user ${userId}`);
    
    // Reconstruct the request for downstream middleware
    c.req.raw = new Request(c.req.raw.url, {
      method: c.req.raw.method,
      headers: c.req.raw.headers,
      body: JSON.stringify(body)
    });
    
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    logger.error("Prompt classification error:", error);
    return c.json({ 
      error: "Failed to process request", 
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}

// Validation schemas
const sendChatSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string().optional(),
      role: z.enum(["user", "assistant", "system", "function", "data", "tool"]),
      content: z.string(),
      name: z.string().optional(),
    }),
  ),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        contentType: z.string(),
      }),
    )
    .optional(),
});

const historyChatSchema = z.object({
  limit: z.coerce.number().optional().default(10),
});

/**
 * Chat routes with authentication and prompt classification
 */
const chatRoutes = new Hono()
  // Apply authentication middleware to all routes
  .use("*", auth(), requireAuth)
  // Apply permission check middleware
  .use("*", permitChatMiddleware())
  
  // Send a chat message and get a streaming response
  .post("/", promptClassifierMiddleware, zValidator("json", sendChatSchema), async (c) => {
    try {
      // Parse request body
      const { messages, attachments } = c.req.valid("json");
      const userId = getUserId(c);
      
      // Get permission context from middleware
      const permitContext = c.get("permitContext");

      logger.info(`Chat request from user ${userId} with ${messages.length} messages`);

      // Process chat through service
      const result = await chatService.processChat({
        messages: messages as Message[],
        userId,
        attachments,
        permissionFilters: permitContext.filters,
        promptClassification: permitContext.classification
      });

      // Set appropriate headers for streaming
      c.header("X-Vercel-AI-Data-Stream", "v1");
      c.header("Content-Type", "text/plain; charset=utf-8");

      // Return streamed response
      return stream(c, async (stream) => {
        try {
          // Pipe the AI SDK response to the HTTP stream
          await stream.pipe(
            result.toDataStream({
              sendReasoning: true,
              getErrorMessage(error) {
                logger.error(`Stream error for user ${userId}:`, error);
                return "An error occurred while processing your request";
              },
            }),
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Streaming error for user ${userId}:`, error);
          await stream.write(`Error: Failed to process your request - ${errorMessage}`);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Chat route error:", error);
      return c.json({ error: "Failed to process chat request", details: errorMessage }, 500);
    }
  })
  
  // Health check endpoint
  .get("/", async (c) => {
    return c.json({ message: "Chat route is working" });
  })

  // Get chat history for the authenticated user
  .get("/history", zValidator("query", historyChatSchema), async (c) => {
    try {
      const userId = getUserId(c);
      const { limit } = c.req.valid("query");

      logger.info(`Getting chat history for user ${userId}, limit: ${limit}`);

      const history = await chatService.getChatHistory(userId, limit);

      return c.json({ history });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Get chat history error:", error);
      return c.json({ error: "Failed to get chat history", details: errorMessage }, 500);
    }
  });

export { chatRoutes };
