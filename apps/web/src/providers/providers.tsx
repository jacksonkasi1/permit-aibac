"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { ThemeProviderProps } from "next-themes";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props}>
      <QueryProvider>
        <TooltipProvider delayDuration={320}>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
