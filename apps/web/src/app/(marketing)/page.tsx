"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, ShieldCheck, Stethoscope, FileText, Brain, 
  ClipboardList, UserCircle2, FlaskConical, Users, BadgeAlert } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// Role types based on Permit.io RBAC model
type UserRole = "Admin" | "Doctor" | "Patient" | "Researcher" | null;

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  // Simulating role detection - in a real app, this would come from Permit.io
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // This is a simulation - in a real app, you would query Permit.io or your backend
      // For demo purposes, we're using the email domain to assign roles
      const email = user.primaryEmailAddress?.emailAddress || "";
      
      if (email.includes("admin")) {
        setUserRole("Admin");
      } else if (email.includes("doctor") || email.includes("dr")) {
        setUserRole("Doctor");
      } else if (email.includes("researcher") || email.includes("research")) {
        setUserRole("Researcher");
      } else {
        setUserRole("Patient"); // Default role
      }
    } else {
      setUserRole(null);
    }
  }, [isLoaded, isSignedIn, user]);

  // Check if user is both loaded and signed in
  const isAuthenticated = isLoaded && isSignedIn;

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
          
          {/* Role-specific greeting - only shown when authenticated */}
          {isAuthenticated && userRole && (
            <div className="mt-2 rounded-md bg-primary/10 p-4 text-primary-foreground">
              <p className="text-lg font-medium">Welcome, {userRole}</p>
              <p className="text-sm text-muted-foreground">
                {userRole === "Admin" && "You have full system access with all permissions."}
                {userRole === "Doctor" && "You can access patient records and create medical data."}
                {userRole === "Patient" && "You can view your own records and manage appointments."}
                {userRole === "Researcher" && "You have access to anonymized medical data."}
              </p>
            </div>
          )}
          
          {/* Call to action buttons */}
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link href="/chat">
                <Button>
                  Try AI Assistant <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/signin">
                <Button>
                  Sign In <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            )}
            <Link href="/security">
              <Button variant="outline">
                Security Features <Lock className="ml-2 size-4" />
              </Button>
            </Link>
          </div>

          {/* Feature cards - shown to everyone */}
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
          
          {/* Role-specific features - only shown when authenticated */}
          {isAuthenticated && userRole && (
            <div className="mt-12 w-full">
              <h2 className="mb-6 text-2xl font-bold">Features Available to You</h2>
              
              {/* Admin features */}
              {userRole === "Admin" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">User Management</h3>
                      <p className="text-sm text-muted-foreground">Full access to all user accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <BadgeAlert className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Audit Logs</h3>
                      <p className="text-sm text-muted-foreground">Monitor system security and compliance</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Security Controls</h3>
                      <p className="text-sm text-muted-foreground">Configure system permissions and policies</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Doctor features */}
              {userRole === "Doctor" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Patient Records</h3>
                      <p className="text-sm text-muted-foreground">Access and edit patient medical records</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Diagnostic AI</h3>
                      <p className="text-sm text-muted-foreground">AI-assisted diagnostic tools</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Prescription Management</h3>
                      <p className="text-sm text-muted-foreground">Create and manage patient prescriptions</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Patient features */}
              {userRole === "Patient" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <UserCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Your Medical Records</h3>
                      <p className="text-sm text-muted-foreground">View your personal health information</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Appointments</h3>
                      <p className="text-sm text-muted-foreground">Schedule appointments with doctors</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Health Assistant</h3>
                      <p className="text-sm text-muted-foreground">Get answers to health questions with AI</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Researcher features */}
              {userRole === "Researcher" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <FlaskConical className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Anonymized Data</h3>
                      <p className="text-sm text-muted-foreground">Access to anonymized patient data</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Research Insights</h3>
                      <p className="text-sm text-muted-foreground">AI-powered research tools</p>
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border bg-card p-4 text-card-foreground shadow">
                    <div className="mr-4 rounded-full bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Data Reports</h3>
                      <p className="text-sm text-muted-foreground">Generate research reports from data</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
