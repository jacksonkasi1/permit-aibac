import { relations, sql } from "drizzle-orm";
// Drizzle core imports
import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Forward declarations for relations
import type {
  AiResponse,
  Appointment,
  AuditLog,
  Chat,
  Diagnosis,
  Insurance,
  MedicalRecord,
  Notification,
  Prescription,
  RagQuery,
  TreatingPhysicianRelationship,
  UserRole,
} from "./index";

/**
 * Users table - System users with different roles
 */
export const tbl_users = pgTable("tbl_users", {
  ...idField,
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // Admin, Doctor, Patient, Researcher
  department: text("department"),
  clearance: integer("clearance"),
  specialization: text("specialization"),
  is_blocked: boolean("is_blocked").notNull().default(false),
  tenant_id: uuid("tenant_id"),
  ...timestamps,
});

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type User = typeof tbl_users.$inferSelect;
export type NewUser = typeof tbl_users.$inferInsert;
