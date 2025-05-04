import { Message, UIMessage } from "ai";
import { getApiClient } from "./client";

// Define types for our API
interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

/**
 * Interface for chat message request parameters
 */
export interface ChatRequestParams {
  messages: Message[];
  attachments?: Attachment[];
}

/**
 * Interface for chat response
 */
export interface ChatResponse {
  id: string;
  messages: Message[];
  createdAt: string;
}

/**
 * Interface for chat history response
 */
export interface ChatHistoryResponse {
  history: Array<{
    id: string;
    messages: Message[];
    createdAt: string;
  }>;
}

/**
 * Send a chat message to the API
 * Note: This is meant for direct non-streaming access
 * For chat UI with streaming, use the AI SDK directly with useChat hook
 */
export async function sendChatMessage({
  messages,
  attachments,
}: ChatRequestParams): Promise<ChatResponse> {
  try {
    const client = await getApiClient();

    // Check if the chat endpoint exists
    if (!client.chat) {
      throw new Error("Chat API endpoint not available");
    }

    const response = await client.chat.$post({
      json: { messages, attachments },
    });

    if (!response.ok) {
      throw new Error(`Failed to send chat message: ${response.statusText}`);
    }

    return response.json() as Promise<ChatResponse>;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

/**
 * Get chat history for the authenticated user
 * @param limit Maximum number of chat history items to return (default: 10)
 */
export async function getChatHistory(limit = 10): Promise<ChatHistoryResponse> {
  try {
    const client = await getApiClient();

    // Check if the chat endpoint exists
    if (!client.chat) {
      throw new Error("Chat API endpoint not available");
    }

    // Since the API structure may vary, we're using any temporarily
    // This should be properly typed in production code
    const response = await (client.chat as any).history.$get({
      query: { limit },
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.statusText}`);
    }

    return response.json() as Promise<ChatHistoryResponse>;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
}

/**
 * Converts UI messages to core messages format used by the AI SDK
 * This helps when working with useChat hook and the API
 */
export function convertToCoreMessages(uiMessages: UIMessage[]): Message[] {
  return uiMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }));
}

// Type exports for use in components
export type SendChatMessageParams = {
  messages: Message[];
  attachments?: Attachment[];
};

export type GetChatHistoryParams = {
  limit?: number;
};
