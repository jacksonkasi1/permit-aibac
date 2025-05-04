"use client";

import { PromptChat } from "@/components/chat/prompt-chat";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { newIdWithoutPrefix } from "@repo/id";
import { useLocalStorage } from "usehooks-ts";
import { ChatContainer } from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";

const SAMPLE_PROMPTS = [
  "Tell me about your AI services",
  "How can I use your API?",
  "What's new in the latest release?",
  "Can you help me with coding?",
  "Generate a sample policy"
];

export default function ChatPage() {
  const router = useRouter();
  const [, setLocalStorageInput] = useLocalStorage("input", "");
  const [inputValue, setInputValue] = useState("");
  const chatId = `home-${Date.now()}`;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<{
    setInput: (value: string) => void;
  }>(null);

  // This effect handles updating the chat input when a prompt suggestion is clicked
  useEffect(() => {
    if (inputValue && chatRef.current) {
      chatRef.current.setInput?.(inputValue);
    }
  }, [inputValue]);
  
  return (
    <div className="flex h-[calc(100dvh-49px)] w-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-6 text-center">
          <h1 className="text-4xl font-bold">Chat bot template</h1>
          <p className="mt-2 text-lg text-muted-foreground">Ask any chat questions</p>
        </div>
        
        {/* Chat area */}
        <div className="relative flex-1 overflow-hidden">
          <ChatContainer
            className="flex-1 h-full overflow-y-auto p-4"
            ref={containerRef}
          >
            <div className="h-full">
              <PromptChat 
                id={chatId} 
                isHomePage={true}
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
        
        {/* Fixed prompt suggestions area at bottom */}
        <div className="border-t p-4">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex flex-wrap justify-center gap-2">
              {SAMPLE_PROMPTS.map((prompt) => (
                <PromptSuggestion 
                  key={prompt} 
                  onClick={(text) => setInputValue(text)}
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
