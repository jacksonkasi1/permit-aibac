// Drizzle core imports
import { date, jsonb, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Insurance table - Patient insurance details
 */
export const tbl_insurance = pgTable(
  "tbl_insurance",
  {
    ...idField,
    patient_id: uuid("patient_id")
      .notNull()
      .references(() => tbl_users.id),
    provider: text("provider").notNull(),
    policy_number: text("policy_number").notNull(),
    coverage: jsonb("coverage"),
    start_date: date("start_date").notNull(),
    end_date: date("end_date"),
    ...timestamps,
  },
  (table) => {
    return {
      // Unique constraint to ensure one insurance record per patient
      patient_id_unique: unique("patient_id_unique").on(table.patient_id),
    };
  },
);

// Type Inference
export type Insurance = typeof tbl_insurance.$inferSelect;
export type NewInsurance = typeof tbl_insurance.$inferInsert;
