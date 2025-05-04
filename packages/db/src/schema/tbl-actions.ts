// Drizzle core imports
import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField, timestamps } from "./common";

// Related table imports
import { tbl_resources } from "./tbl-resources";

/**
 * Actions table - Possible actions on resources
 */
export const tbl_actions = pgTable(
  "tbl_actions",
  {
    ...idField,
    resource_id: uuid("resource_id")
      .notNull()
      .references(() => tbl_resources.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      // Enforce unique action keys per resource
      unique_resource_action: unique("unique_resource_action").on(table.resource_id, table.key),
    };
  },
);

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type Action = typeof tbl_actions.$inferSelect;
export type NewAction = typeof tbl_actions.$inferInsert;
