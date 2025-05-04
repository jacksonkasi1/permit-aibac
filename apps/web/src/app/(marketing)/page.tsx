import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      {/* Hero Section */}
      <section className="space-y-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <Link
            href="https://github.com/your-repo"
            className="rounded-2xl bg-muted px-4 py-1.5 font-medium text-sm"
            target="_blank"
          >
            GitHub
          </Link>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            WebApp Starter Template
          </h1>
          <p className="max-w-[42rem] text-muted-foreground leading-normal sm:text-xl sm:leading-8">
            A production-ready starter template with everything you need to build a modern
            full-stack web application
          </p>
          <div className="space-x-4">
            <Link href="#">
              <Button>
                Get Started <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="#">
              <Button variant="outline">
                View Examples <Code2 className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
