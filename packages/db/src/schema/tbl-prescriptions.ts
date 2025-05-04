// Drizzle core imports
import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

import { tbl_medical_records } from "./tbl-medical-records";
// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Prescriptions table - Medication prescriptions and history
 */
export const tbl_prescriptions = pgTable("tbl_prescriptions", {
  ...idField,
  medical_record_id: uuid("medical_record_id")
    .notNull()
    .references(() => tbl_medical_records.id, { onDelete: "cascade" }),
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => tbl_users.id),
  doctor_id: uuid("doctor_id")
    .notNull()
    .references(() => tbl_users.id),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  ...timestamps,
});

// Type Inference
export type Prescription = typeof tbl_prescriptions.$inferSelect;
export type NewPrescription = typeof tbl_prescriptions.$inferInsert;
