"use client";

import { useState, useRef } from "react";
import { PromptChat } from "@/components/chat/prompt-chat";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { ChatContainer } from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";

const FOLLOW_UP_PROMPTS = [
  "Tell me more about that",
  "Can you explain with an example?",
  "What are the alternatives?",
  "How can I implement this?",
  "What are the best practices?"
];

interface ChatLayoutProps {
  id: string;
}

export function ChatLayout({ id }: ChatLayoutProps) {
  const [inputValue, setInputValue] = useState("");
  const chatRef = useRef<{
    setInput: (value: string) => void;
  }>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePromptClick = (text: string) => {
    setInputValue(text);
    // Also update the input directly through the ref for immediate effect
    if (chatRef.current) {
      chatRef.current.setInput(text);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Main chat content area */}
      <div className="relative flex-1 overflow-hidden">
        <ChatContainer 
          className="flex-1 h-full overflow-y-auto space-y-4 p-4" 
          ref={containerRef}
        >
          {/* This is a placeholder - actual messages are rendered by the PromptChat component */}
          <div className="h-full">
            <PromptChat 
              id={id} 
              initialMessages={[]} 
              isReadonly={false} 
              initialInput={inputValue}
              ref={chatRef}
            />
          </div>
        </ChatContainer>
        
        <div className="absolute bottom-4 right-4">
          <ScrollButton 
            containerRef={containerRef}
            scrollRef={containerRef}
          />
        </div>
      </div>

      {/* Fixed prompt suggestions and input at bottom */}
      <div className="border-t p-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {FOLLOW_UP_PROMPTS.map((prompt) => (
              <PromptSuggestion 
                key={prompt} 
                onClick={(text) => handlePromptClick(text)}
                variant="outline"
                size="sm"
              >
                {prompt}
              </PromptSuggestion>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
