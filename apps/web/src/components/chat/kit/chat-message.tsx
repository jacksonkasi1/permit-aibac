import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message as AIMessage } from "ai";
import { Sparkle } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: AIMessage;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Extract content from message (handling both string and parts)
  const content =
    typeof message.content === "string"
      ? message.content
      : message.parts
          ?.filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n") || "";

  return (
    <div
      className={cn(
        "group my-2 flex w-full items-start gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
          <Sparkle className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3 py-2 text-[15px]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isAssistant ? (
          <div className="prose dark:prose-invert prose-pre:p-0 prose-p:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function ThinkingMessage() {
  return (
    <div className="my-2 flex w-full items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
        <Sparkle className="h-4 w-4" />
      </div>
      <div className="rounded-xl bg-muted px-3 py-2 text-[15px] text-muted-foreground">
        Thinking...
      </div>
    </div>
  );
}
