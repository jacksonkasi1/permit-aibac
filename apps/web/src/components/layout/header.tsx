"use client";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Heart, Menu, Shield, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">HealthGuard AI</span>
            </Link>
          </div>
          
          {/* Navigation - different for signed in vs signed out users */}
          <nav className="hidden space-x-4 md:flex">
            <SignedIn>
              {/* Only show these links when signed in */}
              <Link
                href="/dashboard"
                className="font-medium text-muted-foreground text-sm hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/records"
                className="font-medium text-muted-foreground text-sm hover:text-primary"
              >
                Medical Records
              </Link>
              <Link
                href="/appointments"
                className="font-medium text-muted-foreground text-sm hover:text-primary"
              >
                Appointments
              </Link>
            </SignedIn>
            
            {/* Always show AI Assistant link */}
            <Link
              href="/chat"
              className="font-medium text-muted-foreground text-sm hover:text-primary"
            >
              AI Assistant
            </Link>
          </nav>
          
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              href="/security"
              className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </Link>
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </SignedOut>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[68px] bottom-0 bg-background md:hidden",
          "border-t",
          isMenuOpen ? "block" : "hidden",
        )}
        id="mobile-menu"
        aria-labelledby="mobile-menu-button"
      >
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col space-y-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/signup" className={buttonVariants({ size: "sm", className: "w-full" })}>
                Sign up
              </Link>
              <Link
                href="/signin"
                className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}
              >
                Log in
              </Link>
            </SignedOut>
          </div>

          <nav className="flex flex-col space-y-4">
            <SignedIn>
              {/* Only show these links when signed in */}
              <Link
                href="/dashboard"
                className="font-medium text-base text-muted-foreground hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/records"
                className="font-medium text-base text-muted-foreground hover:text-primary"
              >
                Medical Records
              </Link>
              <Link
                href="/appointments"
                className="font-medium text-base text-muted-foreground hover:text-primary"
              >
                Appointments
              </Link>
            </SignedIn>
            
            {/* Always show AI Assistant link */}
            <Link
              href="/chat"
              className="font-medium text-base text-muted-foreground hover:text-primary"
            >
              AI Assistant
            </Link>
            
            <Link
              href="/security"
              className="flex items-center space-x-2 font-medium text-base text-muted-foreground hover:text-primary"
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </Link>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
