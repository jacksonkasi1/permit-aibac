// Drizzle core imports
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Audit Logs table - Records of all system interactions for compliance
 */
export const tbl_audit_logs = pgTable("tbl_audit_logs", {
  ...idField,
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => tbl_users.id),
  user_role: text("user_role").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  allowed: boolean("allowed").notNull(),
  context: jsonb("context").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
});

// Type Inference
export type AuditLog = typeof tbl_audit_logs.$inferSelect;
export type NewAuditLog = typeof tbl_audit_logs.$inferInsert;
