import { google } from "@ai-sdk/google";
import { db } from "@repo/db";
import { logger } from "@repo/logs";
import { Message } from "ai";
import { smoothStream, streamText } from "ai";

/**
 * Service for handling chat-related business logic
 */
export const chatService = {
  /**
   * Process a chat conversation and generate a streaming response
   */
  async processChat({
    messages,
    userId,
    attachments = [],
  }: {
    messages: Message[];
    userId: string;
    attachments?: Array<{ name: string; url: string; contentType: string }>;
  }) {
    logger.debug(`Processing chat for user ${userId} with ${messages.length} messages`);

    try {
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

      // Save conversation to database
      this.saveConversation({
        userId,
        messages,
      }).catch((err) => {
        logger.error("Failed to save conversation:", err);
      });

      return result;
    } catch (error) {
      logger.error(`Error processing chat for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Save conversation to database for history tracking
   */
  async saveConversation({
    userId,
    messages,
  }: {
    userId: string;
    messages: Message[];
  }) {
    try {
      logger.debug(`Saving conversation for user ${userId}`);

      // Implementation would depend on your database schema
      // This is a placeholder for the actual implementation

      // Example implementation (uncomment when schema is ready):
      /*
      const lastMessage = messages[messages.length - 1];
      
      if (!lastMessage) return;
      
      if (lastMessage.role === "user") {
        // Don't save if last message is from user (no response yet)
        return;
      }
      
      const userMessage = messages[messages.length - 2];
      
      if (userMessage?.role !== "user") return;
      
      await db.insert(chatHistory).values({
        userId,
        userMessage: userMessage.content,
        aiResponse: lastMessage.content,
        createdAt: new Date(),
      });
      */
    } catch (error) {
      logger.error(`Error saving conversation for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string, limit = 10) {
    try {
      logger.debug(`Getting chat history for user ${userId}`);

      // Implementation would depend on your database schema
      // This is a placeholder for the actual implementation

      // Example implementation (uncomment when schema is ready):
      /*
      const history = await db.query.chatHistory.findMany({
        where: (fields, { eq }) => eq(fields.userId, userId),
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        limit,
      });
      
      return history;
      */

      return [];
    } catch (error) {
      logger.error(`Error getting chat history for user ${userId}:`, error);
      throw error;
    }
  },
};
