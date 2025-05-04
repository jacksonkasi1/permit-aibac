// Drizzle core imports
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

import { tbl_rag_queries } from "./tbl-rag-queries";
// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * AI Responses table - Generated responses from the AI system
 */
export const tbl_ai_responses = pgTable("tbl_ai_responses", {
  ...idField,
  query_id: uuid("query_id")
    .notNull()
    .references(() => tbl_rag_queries.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => tbl_users.id),
  content: text("content").notNull(),
  source_references: jsonb("source_references"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

// Type Inference
export type AiResponse = typeof tbl_ai_responses.$inferSelect;
export type NewAiResponse = typeof tbl_ai_responses.$inferInsert;
