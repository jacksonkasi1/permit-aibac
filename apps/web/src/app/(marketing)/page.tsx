import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, ShieldCheck, Stethoscope, FileText, Brain } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      {/* Hero Section */}
      <section className="space-y-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 rounded-2xl bg-muted px-4 py-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Secure Healthcare AI</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            HealthGuard AI
          </h1>
          <p className="max-w-[42rem] text-muted-foreground leading-normal sm:text-xl sm:leading-8">
            A secure AI system with fine-grained access controls for medical data powered by Permit.io, Vercel AI SDK, and Google AI
          </p>
          <div className="space-x-4">
            <Link href="/chat">
              <Button>
                Try AI Assistant <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/security">
              <Button variant="outline">
                Security Features <Lock className="ml-2 size-4" />
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow transition-all hover:shadow-md">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-medium">Attribute-Based Access</h3>
              <p className="text-center text-sm text-muted-foreground">
                Fine-grained ABAC/RBAC controls for medical data access
              </p>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow transition-all hover:shadow-md">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-medium">Role-Based Access</h3>
              <p className="text-center text-sm text-muted-foreground">
                Different permissions for doctors, patients, and researchers
              </p>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow transition-all hover:shadow-md">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-medium">AI-Powered Insights</h3>
              <p className="text-center text-sm text-muted-foreground">
                Secure medical assistance with Google AI and Vercel AI SDK
              </p>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow transition-all hover:shadow-md">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-medium">Medical Records</h3>
              <p className="text-center text-sm text-muted-foreground">
                Secure storage and retrieval of patient health information
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
