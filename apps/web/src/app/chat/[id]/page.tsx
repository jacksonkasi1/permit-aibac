"use client";

import { getChatHistory } from "@/api/chat.api";
import { type Message } from "ai";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatLayout } from "./_components/chat-layout";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  // Attempt to load chat history if available
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // Call history API to get past messages
        const response = await getChatHistory();

        // Find messages for this chat ID (if implementation supports it)
        // For now, we'll just start with an empty chat
        // setInitialMessages(response.history);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [chatId]);

  return (
    <div className="flex h-screen flex-col">

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse">Loading conversation...</div>
          </div>
        ) : (
          <ChatLayout id={chatId} initialMessages={initialMessages} />
        )}
      </div>
    </div>
  );
}
