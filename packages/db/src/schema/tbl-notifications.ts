// Drizzle core imports
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Notifications table - System notifications and alerts
 */
export const tbl_notifications = pgTable("tbl_notifications", {
  ...idField,
  user_id: uuid("user_id")
    .notNull()
    .references(() => tbl_users.id),
  content: text("content").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

// Type Inference
export type Notification = typeof tbl_notifications.$inferSelect;
export type NewNotification = typeof tbl_notifications.$inferInsert;
