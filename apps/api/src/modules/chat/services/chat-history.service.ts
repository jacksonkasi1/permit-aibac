import { db, eq, desc, tbl_chats, Chat, NewChat } from "@repo/db";
import { logger } from "@repo/logs";
import { Message } from "ai";
import { authorizeRagQuery } from "@repo/permit";

/**
 * Service for managing chat history
 */
export const chatHistoryService = {
  /**
   * Save a conversation to the database
   */
  async saveConversation({
    userId,
    messages,
  }: {
    userId: string;
    messages: Message[];
  }): Promise<string | null> {
    try {
      logger.debug(`Saving conversation for user ${userId} with ${messages.length} messages`);
      
      if (messages.length === 0) {
        logger.warn("No messages to save");
        return null;
      }
      
      // Check if there's an existing chat session for this user
      const existingChats = await db
        .select()
        .from(tbl_chats)
        .where(eq(tbl_chats.user_id, userId))
        .orderBy(desc(tbl_chats.updated_at))
        .limit(1);

      // If there's an existing recent chat, update it
      if (existingChats.length > 0 && existingChats[0] && isRecent(existingChats[0].updated_at)) {
        const chatId = existingChats[0].id;
        
        await db
          .update(tbl_chats)
          .set({
            messages: JSON.stringify(messages),
            updated_at: new Date(),
          })
          .where(eq(tbl_chats.id, chatId));
        
        logger.debug(`Updated chat session ${chatId}`);
        return chatId;
      }

      // Otherwise create a new chat session
      const newChat: NewChat = {
        user_id: userId,
        messages: messages as any, // Drizzle handles JSON conversion
        started_at: new Date(),
        updated_at: new Date(),
      };
      
      const insertResult = await db.insert(tbl_chats).values(newChat).returning();
      
      if (!insertResult || insertResult.length === 0 || !insertResult[0]) {
        throw new Error("Failed to insert chat record");
      }
      
      const chatId = insertResult[0].id;
      logger.debug(`Created new chat session ${chatId} for user ${userId}`);
      
      return chatId;
    } catch (error) {
      logger.error(`Error saving conversation for user ${userId}:`, {
        error,
        messagesCount: messages.length
      });
      return null;
    }
  },

  /**
   * Get user's chat history
   */
  async getChatHistory(userId: string, limit = 10): Promise<any[]> {
    try {
      logger.debug(`Getting chat history for user ${userId}, limit: ${limit}`);

      // Check permission using Permit.io
      try {
        const authResult = await authorizeRagQuery(userId, "", "chat");
        if (!authResult.allowed) {
          logger.warn(`User ${userId} not authorized to view chat history`);
          return []; // Return empty array instead of throwing error
        }
      } catch (permError) {
        // Log permission error but continue for users' own chats
        logger.error(`Permission check error for user ${userId}:`, permError);
        // We'll fall through to at least let users see their own chats
      }

      // Get chat history from the database - users can always see their own chats
      const history = await db
        .select()
        .from(tbl_chats)
        .where(eq(tbl_chats.user_id, userId))
        .orderBy(desc(tbl_chats.updated_at))
        .limit(limit);

      return history.map((chat) => ({
        id: chat.id,
        messages: chat.messages as Message[],
        startedAt: chat.started_at,
        updatedAt: chat.updated_at,
      }));
    } catch (error) {
      logger.error(`Error getting chat history for user ${userId}:`, {
        error,
        limit
      });
      throw error;
    }
  }
};

/**
 * Check if the timestamp is recent (within the last hour)
 */
function isRecent(timestamp: Date): boolean {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  return timestamp > hourAgo;
} 