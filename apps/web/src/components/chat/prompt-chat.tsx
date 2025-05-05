"use client";

import { useChat } from "@ai-sdk/react";
import { newIdWithoutPrefix } from "@repo/id";
import type { Attachment, Message } from "ai";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import { getChatHistory } from "@/api/chat.api";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessage, ThinkingMessage } from "@/components/chat/kit/chat-message";
import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from "@/components/chat/kit/file-upload";
import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/chat-container";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { CHAT_API_URL, customFetcher } from "@/lib/fetcher";
import { Paperclip, SendHorizontal, Square } from "lucide-react";

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
  { id, initialMessages = [], isReadonly = false, isHomePage = false, initialInput = "" },
  ref,
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
    api: CHAT_API_URL,
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
      // Error is already handled by customFetcher with toast notifications
      console.error(err);
    },
  });

  useImperativeHandle(ref, () => ({
    setInput,
  }));

  const handleFileAdded = (files: File[]) => {
    const newAttachments: Attachment[] = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`Added ${files.length} file${files.length > 1 ? "s" : ""}`);
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
    <div className="flex h-full w-full flex-col">
      {/* Chat Header for non-home pages */}
      {!isHomePage && <ChatHeader chatId={id} />}

      {/* Chat Messages Area */}
      <div className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col space-y-4 px-4 py-4">
          {messages.length === 0 && (
            <div className="mt-8 flex h-full flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
            </div>
          )}

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
        </div>
      </div>

      {/* Chat Input Area */}
      {!isReadonly && (
        <div className="mx-auto w-full max-w-3xl px-4 pt-2">
          <FileUpload onFilesAdded={handleFileAdded} multiple={true} disabled={isInputDisabled}>
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
                      <Button type="button" size="icon" variant="ghost" disabled={isInputDisabled}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </FileUploadTrigger>
                  </PromptInputAction>
                </div>

                <PromptInputTextarea
                  placeholder="Send a message..."
                  className="min-h-[60px]"
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
              <div className="flex h-64 w-80 flex-col items-center justify-center rounded-lg border border-primary border-dashed">
                <div className="text-center">
                  <p className="font-medium text-sm">Drop your files here</p>
                  <p className="text-muted-foreground text-xs">
                    Files will be uploaded when you drop them
                  </p>
                </div>
              </div>
            </FileUploadContent>
          </FileUpload>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-md bg-accent p-1 text-xs"
                >
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
