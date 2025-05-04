"use client";

import { PromptChat } from "@/components/chat/prompt-chat";
import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/chat-container";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Message } from "ai";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";

const FOLLOW_UP_PROMPTS = [
  "What are the potential side effects?",
  "How does this affect my existing condition?",
  "Are there any lifestyle changes I should make?",
  "When should I consult my doctor?",
  "Can you provide more detailed information?",
];

interface ChatLayoutProps {
  id: string;
  initialMessages?: Array<Message>;
}

export function ChatLayout({ id, initialMessages = [] }: ChatLayoutProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
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

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Main chat content area */}
      <div className="relative flex-1 overflow-hidden">
        <ChatContainer className="h-full flex-1 space-y-4 overflow-y-auto p-4" ref={containerRef}>
          {/* This is a placeholder - actual messages are rendered by the PromptChat component */}
          <div className="h-full">
            <PromptChat
              id={id}
              initialMessages={initialMessages}
              isReadonly={false}
              initialInput={inputValue}
              ref={chatRef}
            />
          </div>
        </ChatContainer>

        <div className="absolute right-4 bottom-4">
          <ScrollButton containerRef={containerRef} scrollRef={containerRef} />
        </div>
      </div>

      {/* Toggle button and suggestions */}
      <div className="border-t">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSuggestions}
              className="flex items-center gap-1 text-muted-foreground text-sm"
            >
              {showSuggestions ? "Hide suggestions" : "Show suggestions"}
              {showSuggestions ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showSuggestions ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-wrap justify-center gap-2 p-4">
              {FOLLOW_UP_PROMPTS.map((prompt) => (
                <PromptSuggestion
                  key={prompt}
                  onClick={(text) => handlePromptClick(text)}
                  variant="outline"
                >
                  {prompt}
                </PromptSuggestion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
