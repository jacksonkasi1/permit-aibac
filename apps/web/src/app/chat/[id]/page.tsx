"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PromptChat } from "@/components/chat/prompt-chat";
import { PageHeader } from "@/components/layout/page-header";
import { getChatHistory } from "@/api/chat.api";
import { type Message } from "ai";

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
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setIsLoading(false);
      }
    };
    
    loadChatHistory();
  }, [chatId]);

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Chat" description="Conversation with AI" />
      
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse">Loading conversation...</div>
          </div>
        ) : (
          <PromptChat
            id={chatId}
            initialMessages={initialMessages}
          />
        )}
      </div>
    </div>
  );
}
