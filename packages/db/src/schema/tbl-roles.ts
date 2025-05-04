// Drizzle core imports
import { pgTable, text, unique } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

/**
 * Roles table - System role definitions
 */
export const tbl_roles = pgTable(
  "tbl_roles",
  {
    ...idField,
    key: text("key").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      // Enforce unique role keys
      unique_key: unique("unique_role_key").on(table.key),
    };
  },
);

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type Role = typeof tbl_roles.$inferSelect;
export type NewRole = typeof tbl_roles.$inferInsert;
