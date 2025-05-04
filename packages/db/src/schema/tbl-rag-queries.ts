// Drizzle core imports
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Common utility imports
import { idField } from "./common";

// Related table imports
import { tbl_users } from "./tbl-users";

/**
 * RAG Queries table - Vector search queries for retrieving medical information
 */
export const tbl_rag_queries = pgTable("tbl_rag_queries", {
  ...idField,
  user_id: uuid("user_id")
    .notNull()
    .references(() => tbl_users.id),
  query: text("query").notNull(),
  resource_type: text("resource_type"),
  results: jsonb("results"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

// Type Inference
export type RagQuery = typeof tbl_rag_queries.$inferSelect;
export type NewRagQuery = typeof tbl_rag_queries.$inferInsert;
