"use client";

import { useState, useRef } from "react";
import { PromptChat } from "@/components/chat/prompt-chat";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { ChatContainer } from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

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

      {/* Toggle button and suggestions */}
      <div className="border-t">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex justify-center py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSuggestions}
              className="text-sm text-muted-foreground flex items-center gap-1"
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
