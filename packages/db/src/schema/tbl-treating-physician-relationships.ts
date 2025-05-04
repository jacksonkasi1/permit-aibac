// Drizzle core imports
import { pgTable, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Treating Physician Relationships table - Tracks doctor-patient assignments
 * Many-to-many relationship between doctors and patients
 */
export const tbl_treating_physician_relationships = pgTable(
  "tbl_treating_physician_relationships",
  {
    ...idField,
    doctor_id: uuid("doctor_id")
      .notNull()
      .references(() => tbl_users.id),
    patient_id: uuid("patient_id")
      .notNull()
      .references(() => tbl_users.id),
    ...timestamps,
  },
  (table) => {
    return {
      // Enforce unique doctor-patient relationships
      unique_doctor_patient: unique("unique_doctor_patient").on(table.doctor_id, table.patient_id),
    };
  },
);

// Type Inference
export type TreatingPhysicianRelationship =
  typeof tbl_treating_physician_relationships.$inferSelect;
export type NewTreatingPhysicianRelationship =
  typeof tbl_treating_physician_relationships.$inferInsert;
