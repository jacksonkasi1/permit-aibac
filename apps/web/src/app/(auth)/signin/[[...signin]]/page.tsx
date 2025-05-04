"use client";
import { SignIn } from "@clerk/nextjs";

import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn appearance={{ baseTheme: theme === "dark" ? dark : undefined }} />
    </div>
  );
}
