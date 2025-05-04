// Drizzle core imports
import { pgTable, text, unique } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

/**
 * Resources table - System resources that can be protected
 */
export const tbl_resources = pgTable(
  "tbl_resources",
  {
    ...idField,
    key: text("key").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      // Enforce unique resource keys
      unique_key: unique("unique_resource_key").on(table.key),
    };
  },
);

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type Resource = typeof tbl_resources.$inferSelect;
export type NewResource = typeof tbl_resources.$inferInsert;
