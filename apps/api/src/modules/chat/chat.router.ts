/**
 * Chat router implementation using Google AI SDK
 */
import { auth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { type Message, smoothStream, streamText } from "ai";
import { stream } from "hono/streaming";
import { Hono } from "hono";
import { logger } from "@repo/logs";
import { google } from "@ai-sdk/google";

/**
 * Chat routes with authentication middleware
 */
const chatRoutes = new Hono()
  .use("*", auth(), requireAuth)
  .post("/", async (c) => {
    try {
      // Parse request body
      const { messages } = (await c.req.json()) as {
        messages: Message[];
      };
      const userId = getUserId(c);

      // Initialize Google AI model
      const gemini = google("gemini-2.5-pro-exp-03-25");

      // Stream text response from model
      const result = streamText({
        system: "You are a helpful assistant that can answer questions and help with tasks.",
        messages,
        maxSteps: 10,
        model: gemini,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 1024,
            },
          },
        },
        experimental_transform: smoothStream({
          delayInMs: 20,
        }),
        onError: (error) => {
          logger.error("Google AI error:", error);
        },
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
  });

export { chatRoutes };
