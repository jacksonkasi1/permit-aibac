// Drizzle core imports
import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

import { tbl_resources } from "./tbl-resources";
import { tbl_roles } from "./tbl-roles";
// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * User Roles table - Many-to-many relationship between users and roles
 */
export const tbl_user_roles = pgTable(
  "tbl_user_roles",
  {
    ...idField,
    user_id: uuid("user_id")
      .notNull()
      .references(() => tbl_users.id, { onDelete: "cascade" }),
    role_id: uuid("role_id")
      .notNull()
      .references(() => tbl_roles.id, { onDelete: "cascade" }),
    resource_id: uuid("resource_id").references(() => tbl_resources.id, { onDelete: "cascade" }),
    resource_instance_id: uuid("resource_instance_id"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      // Enforce unique user-role-resource-instance combinations
      unique_user_role_resource: unique("unique_user_role_resource").on(
        table.user_id,
        table.role_id,
        table.resource_id,
        table.resource_instance_id,
      ),
    };
  },
);

/**
 * Relations will be defined after all tables are created
 * to prevent circular dependencies
 */

// Type Inference
export type UserRole = typeof tbl_user_roles.$inferSelect;
export type NewUserRole = typeof tbl_user_roles.$inferInsert;
