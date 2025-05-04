import { sql } from "drizzle-orm";
// Drizzle core imports
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Medical Records table - Patient medical histories, diagnoses, and treatments
 */
export const tbl_medical_records = pgTable("tbl_medical_records", {
  ...idField,
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => tbl_users.id),
  // Using text with a specific validation in the app layer for sensitivity values
  sensitivity: text("sensitivity").notNull(),
  department: text("department"),
  content: text("content"),
  ...timestamps,
});

// Type Inference
export type MedicalRecord = typeof tbl_medical_records.$inferSelect;
export type NewMedicalRecord = typeof tbl_medical_records.$inferInsert;
