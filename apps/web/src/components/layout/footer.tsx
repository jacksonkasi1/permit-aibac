"use client";

import { Heart, Shield } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">HealthGuard AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              A secure AI system with fine-grained access controls for medical data.
            </p>
          </div>

          {/* Security column */}
          <div>
            <h3 className="mb-3 font-medium">Security</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/security" className="text-muted-foreground hover:text-primary">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Security Features</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-muted-foreground hover:text-primary">
                  Compliance
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Powered By column */}
          <div>
            <h3 className="mb-3 font-medium">Powered By</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://permit.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Permit.io
                </a>
              </li>
              <li>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Vercel AI SDK
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Google AI
                </a>
              </li>
              <li>
                <a
                  href="https://eyelevel.ai/groundx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  EyeLevel GroundX
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4">
          <div className="flex flex-col justify-between md:flex-row">
            <p className="text-center text-xs text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} HealthGuard AI. All rights reserved.
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground md:mt-0 md:text-right">
              Secure healthcare with fine-grained authorization
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 