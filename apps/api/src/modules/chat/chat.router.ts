/**
 * Chat router implementation using Vercel AI SDK
 */
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { logger } from "@repo/logs";
import { type Message } from "ai";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import { chatService } from "./chat.service";

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
  limit: z.number().optional().default(10),
});

/**
 * Chat routes with authentication middleware
 */
const chatRoutes = new Hono()
  .use("*", auth(), requireAuth)
  // Send a chat message and get a streaming response
  .post("/", zValidator("json", sendChatSchema), async (c) => {
    try {
      // Parse request body
      const { messages, attachments } = c.req.valid("json");
      const userId = getUserId(c);

      logger.info(`Chat request from user ${userId} with ${messages.length} messages`);

      // Process chat through service
      const result = await chatService.processChat({
        messages: messages as Message[],
        userId,
        attachments,
      });

      // Set appropriate headers for streaming
      c.header("X-Vercel-AI-Data-Stream", "v1");
      c.header("Content-Type", "text/plain; charset=utf-8");

      // Return streamed response
      return stream(c, (stream) =>
        stream.pipe(
          result.toDataStream({
            sendReasoning: true,
            getErrorMessage(error) {
              logger.error(`Stream error for user ${userId}:`, error);
              return "An error occurred while processing your request";
            },
          }),
        ),
      );
    } catch (error) {
      logger.error("Chat route error:", error);
      return c.json({ error: "Failed to process chat request" }, 500);
    }
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
      logger.error("Get chat history error:", error);
      return c.json({ error: "Failed to get chat history" }, 500);
    }
  });

export { chatRoutes };
