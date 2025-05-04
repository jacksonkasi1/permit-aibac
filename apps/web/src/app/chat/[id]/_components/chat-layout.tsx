"use client";

import { useState } from "react";
import { PromptChat } from "@/components/chat/prompt-chat";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";

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

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="flex flex-col">
      <div className="mx-auto mb-4 flex w-full max-w-3xl flex-wrap justify-center gap-2 px-4 pt-4">
        {FOLLOW_UP_PROMPTS.map((prompt) => (
          <PromptSuggestion 
            key={prompt} 
            onClick={() => handlePromptClick(prompt)}
            variant="outline"
            size="sm"
          >
            {prompt}
          </PromptSuggestion>
        ))}
      </div>
      
      <PromptChat 
        id={id} 
        initialMessages={[]} 
        isReadonly={false} 
        initialInput={inputValue}
      />
    </div>
  );
}
