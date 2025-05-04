// Drizzle core imports
import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

import { tbl_medical_records } from "./tbl-medical-records";
// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Diagnoses table - Medical diagnoses with detailed information
 */
export const tbl_diagnoses = pgTable("tbl_diagnoses", {
  ...idField,
  medical_record_id: uuid("medical_record_id")
    .notNull()
    .references(() => tbl_medical_records.id, { onDelete: "cascade" }),
  condition: text("condition").notNull(),
  details: text("details"),
  date: date("date").notNull(),
  doctor_id: uuid("doctor_id")
    .notNull()
    .references(() => tbl_users.id),
  ...timestamps,
});

// Type Inference
export type Diagnosis = typeof tbl_diagnoses.$inferSelect;
export type NewDiagnosis = typeof tbl_diagnoses.$inferInsert;
