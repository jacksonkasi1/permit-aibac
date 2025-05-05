"use client";

import { PromptChat } from "@/components/chat/prompt-chat";
import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/chat-container";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { ScrollButton } from "@/components/ui/scroll-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { newIdWithoutPrefix } from "@repo/id";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

const SAMPLE_PROMPTS = [
  "Explain how to manage my diabetes medication",
  "What are the symptoms of high blood pressure?",
  "How often should I check my blood sugar levels?",
  "What dietary changes can help with cholesterol?",
  "Generate a sample wellness plan for heart health",
];

export default function ChatPage() {
  const router = useRouter();
  const [, setLocalStorageInput] = useLocalStorage("input", "");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
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

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="flex h-[100vh] w-full flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="relative px-4 py-6 text-center">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          <h1 className="font-bold text-4xl">Healthcare Assistant</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your AI guide to health and wellness</p>
        </div>

        {/* Chat area */}
        <div className="relative flex-1 overflow-hidden">
          <ChatContainer className="h-full flex-1 overflow-y-auto p-4" ref={containerRef}>
            <div className="h-full">
              <PromptChat id={chatId} isHomePage={true} initialInput={inputValue} ref={chatRef} />
            </div>
          </ChatContainer>

          <div className="absolute right-4 bottom-4">
            <ScrollButton containerRef={containerRef} scrollRef={containerRef} />
          </div>
        </div>

        {/* Toggle button and suggestions */}
        <div className="border-t">
          <div className="mx-auto w-full max-w-4xl">
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
                {SAMPLE_PROMPTS.map((prompt) => (
                  <PromptSuggestion key={prompt} onClick={(text) => setInputValue(text)}>
                    {prompt}
                  </PromptSuggestion>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
