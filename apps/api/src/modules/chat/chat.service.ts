import { logger } from "@repo/logs";
import { Message } from "ai";
import { authorizeRagQuery, logAccessAttempt } from "@repo/permit";
import { aiService } from "./services/ai.service";
import { chatHistoryService } from "./services/chat-history.service";
import { promptService } from "./services/prompt.service";

/**
 * Main service for handling chat-related business logic
 * This service orchestrates the interaction between different services
 */
export const chatService = {
  /**
   * Process a chat conversation and generate a streaming response
   */
  async processChat({
    messages,
    userId,
    attachments = [],
    permissionFilters = {},
    promptClassification = 'view'
  }: {
    messages: Message[];
    userId: string;
    attachments?: Array<{ name: string; url: string; contentType: string }>;
    permissionFilters?: Record<string, any>;
    promptClassification?: string;
  }) {
    logger.debug(`Processing chat for user ${userId} with ${messages.length} messages, classified as ${promptClassification}`);

    try {
      // Check permission using Permit.io
      const authResult = await aiService.authorizeAccess(userId, promptClassification);
      if (!authResult.allowed) {
        throw new Error(`Unauthorized: You don't have permission to ${promptClassification} in chat`);
      }

      try {
        // Log AI interaction for audit purposes
        await logAccessAttempt(userId, promptClassification, "aiResponse", true, {
          messageCount: messages.length,
          filters: permissionFilters,
          classification: promptClassification
        });

        // Save conversation to database
        const chatId = await chatHistoryService.saveConversation({
          userId,
          messages,
        });

        if (!chatId) {
          logger.warn(`Failed to save chat for user ${userId}`);
        }

        // Create system prompt that enforces permissions
        const systemPrompt = promptService.createPermissionAwareSystemPrompt(
          promptClassification, 
          permissionFilters
        );

        // Process the chat through the AI service
        return await aiService.processChat({
          messages,
          userId,
          systemPrompt,
          attachments
        });
      } catch (modelError) {
        // Log specific model initialization or streaming errors
        logger.error(`Error with AI model for user ${userId}:`, {
          error: modelError,
          messages: messages.length
        });
        throw new Error(`AI model error: ${modelError instanceof Error ? modelError.message : 'Unknown model error'}`);
      }
    } catch (error) {
      // Add detailed logging for the main error
      logger.error(`Error processing chat for user ${userId}:`, {
        error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Re-throw with clear message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error occurred in chat processing");
      }
    }
  },

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string, limit = 10) {
    try {
      return await chatHistoryService.getChatHistory(userId, limit);
    } catch (error) {
      logger.error(`Error getting chat history for user ${userId}:`, {
        error,
        limit
      });
      throw error;
    }
  },
};
