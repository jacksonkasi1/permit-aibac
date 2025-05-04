// Drizzle core imports
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Appointments table - Doctor-patient appointment information
 */
export const tbl_appointments = pgTable("tbl_appointments", {
  ...idField,
  patient_id: uuid("patient_id")
    .notNull()
    .references(() => tbl_users.id),
  doctor_id: uuid("doctor_id")
    .notNull()
    .references(() => tbl_users.id),
  date_time: timestamp("date_time", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("Scheduled"),
  notes: text("notes"),
  ...timestamps,
});

// Type Inference
export type Appointment = typeof tbl_appointments.$inferSelect;
export type NewAppointment = typeof tbl_appointments.$inferInsert;
