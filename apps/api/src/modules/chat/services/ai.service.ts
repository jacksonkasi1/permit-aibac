import { google } from "@ai-sdk/google";
import { logger } from "@repo/logs";
import { Message } from "ai";
import { streamText, smoothStream } from "ai";
import { authorizeRagQuery, logAccessAttempt } from "@repo/permit";
import { permit } from "@repo/permit";

// Google AI models
const GOOGLE_MODEL = "gemini-2.5-pro-exp-03-25";

/**
 * Service for handling AI interactions
 */
export const aiService = {
  /**
   * Check if user has permission to access AI functionality
   */
  async authorizeAccess(userId: string, action: string): Promise<{
    allowed: boolean;
    filters?: Record<string, any>;
  }> {
    try {
      // Attempt to get permissions via Permit.io
      const authResult = await authorizeRagQuery(userId, "", "chat");
      
      // If not allowed, check if this is an admin (admins should always have access)
      if (!authResult.allowed) {
        // This would be a double-check, as the authorizeRagQuery should already
        // handle admins, but adding as a fallback for robustness
        try {
          const userResponse = await permit.api.users.get(userId);
          // Safely check if user has admin role
          if (userResponse?.attributes && 
              typeof userResponse.attributes === 'object' && 
              'role' in userResponse.attributes && 
              userResponse.attributes.role === 'admin') {
            logger.info(`Admin user ${userId} granted access to AI service`);
            return { allowed: true, filters: {} };
          }
        } catch (userError) {
          logger.warn(`Error checking if user ${userId} is admin:`, userError);
          // Continue with the original auth result
        }
      }
      
      return authResult;
    } catch (error) {
      logger.error(`Error checking AI permissions for user ${userId}:`, {
        error,
        action,
        userId
      });
      // For robustness, default to allowing users to see their own chats even if permit fails
      if (action === 'view') {
        logger.warn(`Fallback: Allowing ${userId} view access despite permission error`);
        return { allowed: true, filters: { user_id: userId } };
      }
      return { allowed: false };
    }
  },

  /**
   * Process a chat conversation through Google AI
   */
  async processChat({
    messages,
    userId,
    systemPrompt,
    attachments = [],
  }: {
    messages: Message[];
    userId: string;
    systemPrompt: string;
    attachments?: Array<{ name: string; url: string; contentType: string }>;
  }) {
    logger.debug(`Processing AI request for user ${userId} with ${messages.length} messages`);

    try {
      // Initialize Google AI model
      const gemini = google(GOOGLE_MODEL);

      // Log the AI interaction for audit purposes
      await logAccessAttempt(userId, "process", "aiResponse", true, {
        messageCount: messages.length,
        model: GOOGLE_MODEL
      });

      // Create the AI stream with properly configured options
      const result = streamText({
        system: systemPrompt,
        messages,
        maxSteps: 10,
        model: gemini,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 1024,
            },
            ...(attachments?.length ? { attachments } : {})
          },
        },
        experimental_transform: smoothStream({
          delayInMs: 20,
        }),
        onError: (error) => {
          logger.error(`Google AI error for user ${userId}:`, error);
        },
      });

      return result;
    } catch (error) {
      // Detailed error logging for troubleshooting
      logger.error(`AI processing error for user ${userId}:`, {
        error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        model: GOOGLE_MODEL
      });
      
      throw new Error(`AI model error: ${error instanceof Error ? error.message : 'Unknown error processing your request'}`);
    }
  }
}; 