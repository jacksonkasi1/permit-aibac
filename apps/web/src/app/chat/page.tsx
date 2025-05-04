"use client";

import { PromptChat } from "@/components/chat/prompt-chat";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { newIdWithoutPrefix } from "@repo/id";
import { useLocalStorage } from "usehooks-ts";
import { useChat } from "@ai-sdk/react";

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
    <div className="flex h-[calc(100dvh-49px)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4">
        <h1 className="mb-2 text-center font-bold text-4xl">Chat bot template</h1>
        <p className="mb-4 text-center text-lg text-muted-foreground">Ask any chat questions</p>
        
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <PromptSuggestion 
              key={prompt} 
              onClick={(text) => setInputValue(text)}
            >
              {prompt}
            </PromptSuggestion>
          ))}
        </div>
        
        <div className="w-full">
          <PromptChat 
            id={chatId} 
            isHomePage={true}
            initialInput={inputValue}
            ref={chatRef}
          />
        </div>
      </div>
    </div>
  );
}
