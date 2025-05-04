// User types for Clerk integration
export type UserRole = "admin" | "doctor" | "patient" | "researcher";

export interface ClerkUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  clearance?: number;
  specialization?: string;
  metadata?: {
    role?: string;
    department?: string;
    clearance?: number;
    specialization?: string;
  };
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: string;
  specialization?: string;
  clearance?: number;
}

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  clearance?: number;
}
