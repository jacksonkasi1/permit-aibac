// Drizzle core imports
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * Chats table - AI conversation sessions and history
 */
export const tbl_chats = pgTable("tbl_chats", {
  ...idField,
  user_id: uuid("user_id")
    .notNull()
    .references(() => tbl_users.id),
  messages: jsonb("messages").notNull().default([]),
  started_at: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Type Inference
export type Chat = typeof tbl_chats.$inferSelect;
export type NewChat = typeof tbl_chats.$inferInsert;
