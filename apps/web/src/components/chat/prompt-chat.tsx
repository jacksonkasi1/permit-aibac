"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import type { Attachment, Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { newIdWithoutPrefix } from "@repo/id";

import { customFetcher, chatUrl } from "@/lib/fetcher";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContainer } from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import { ChatMessage, ThinkingMessage } from "@/components/chat/kit/chat-message";
import { 
  PromptInput, 
  PromptInputTextarea, 
  PromptInputActions, 
  PromptInputAction 
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Square, Paperclip } from "lucide-react";
import { 
  FileUpload, 
  FileUploadTrigger, 
  FileUploadContent 
} from "@/components/chat/kit/file-upload";

export type PromptChatRef = {
  setInput: (value: string) => void;
};

export const PromptChat = forwardRef<
  PromptChatRef,
  {
    id: string;
    initialMessages?: Array<Message>;
    isReadonly?: boolean;
    isHomePage?: boolean;
    initialInput?: string;
  }
>(function PromptChat(
  {
    id,
    initialMessages = [],
    isReadonly = false,
    isHomePage = false,
    initialInput = "",
  },
  ref
) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    append,
    status,
    stop,
    setMessages,
  } = useChat({
    initialMessages,
    id,
    api: chatUrl,
    fetch: customFetcher,
    onResponse(response) {
      if (isHomePage) {
        router.push(`/chat/${id}`);
      }
    },
    body: {
      attachments,
    },
    onError: (err) => {
      toast.error("An error occurred while sending your message.");
      console.error(err);
    },
  });

  useImperativeHandle(ref, () => ({
    setInput,
  }));

  const handleFileAdded = (files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`Added ${files.length} file${files.length > 1 ? 's' : ''}`);
  };

  useEffect(() => {
    if (localStorageInput && !isHomePage) {
      append({
        role: "user",
        content: localStorageInput,
      });
      setLocalStorageInput("");
    }
  }, []);

  // Set initial input if provided
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput, setInput]);

  const isGeneratingResponse = status === "submitted";
  const isInputDisabled = status !== "ready" || isReadonly;

  return (
    <div className={`flex min-w-0 flex-col bg-background ${isHomePage ? "h-auto" : "h-[calc(100dvh-40px)]"}`}>
      {!isHomePage && <ChatHeader chatId={id} />}

      {!isHomePage && (
        <div className="relative flex-1">
          <ChatContainer 
            className="flex-1 space-y-4 p-4" 
            ref={containerRef}
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={status === "submitted" && message.id === messages[messages.length - 1]?.id}
              />
            ))}
            
            {status === "submitted" &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role === "user" && <ThinkingMessage />}
          </ChatContainer>
          
          <div className="absolute bottom-4 right-4">
            <ScrollButton 
              scrollRef={containerRef} 
              containerRef={containerRef} 
            />
          </div>
        </div>
      )}

      {!isReadonly && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 md:pb-6">
          <FileUpload
            onFilesAdded={handleFileAdded}
            multiple={true}
            disabled={isInputDisabled}
          >
            <PromptInput
              isLoading={isGeneratingResponse}
              value={input}
              onValueChange={setInput}
              onSubmit={handleSubmit}
              className="bg-background"
            >
              <div className="flex w-full items-center gap-2">
                <div className="flex items-center">
                  <PromptInputAction tooltip="Attach files">
                    <FileUploadTrigger asChild>
                      <Button 
                        type="button"
                        size="icon"
                        variant="ghost" 
                        disabled={isInputDisabled}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </FileUploadTrigger>
                  </PromptInputAction>
                </div>
                
                <PromptInputTextarea 
                  placeholder="Send a message..." 
                  className="min-h-[80px]"
                  disabled={isInputDisabled}
                />
                
                <PromptInputActions>
                  {isGeneratingResponse ? (
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        stop();
                        setMessages((messages) => {
                          const lastMessage = messages[messages.length - 1];
                          if (lastMessage && lastMessage.role === "assistant") {
                            return messages.slice(0, -1);
                          }
                          return messages;
                        });
                      }}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="icon" 
                      disabled={input.trim().length === 0 || isInputDisabled}
                      onClick={handleSubmit}
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </PromptInputActions>
              </div>
            </PromptInput>
            <FileUploadContent>
              <div className="flex h-64 w-80 flex-col items-center justify-center rounded-lg border border-dashed border-primary">
                <div className="text-center">
                  <p className="text-sm font-medium">Drop your files here</p>
                  <p className="text-xs text-muted-foreground">
                    Files will be uploaded when you drop them
                  </p>
                </div>
              </div>
            </FileUploadContent>
          </FileUpload>
          
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-1 rounded-md bg-accent p-1 text-xs">
                  <span className="max-w-[150px] truncate">{attachment.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={() => {
                      setAttachments((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}); 