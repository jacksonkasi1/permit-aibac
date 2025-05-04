// Drizzle core imports
import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

import { tbl_actions } from "./tbl-actions";
// Related table imports
import { tbl_roles } from "./tbl-roles";

/**
 * Permissions table - Many-to-many relationship between roles and actions
 */
export const tbl_permissions = pgTable(
  "tbl_permissions",
  {
    ...idField,
    role_id: uuid("role_id")
      .notNull()
      .references(() => tbl_roles.id, { onDelete: "cascade" }),
    action_id: uuid("action_id")
      .notNull()
      .references(() => tbl_actions.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      // Enforce unique role-action pairs
      unique_role_action: unique("unique_role_action").on(table.role_id, table.action_id),
    };
  },
);

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type Permission = typeof tbl_permissions.$inferSelect;
export type NewPermission = typeof tbl_permissions.$inferInsert;
