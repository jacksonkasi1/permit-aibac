import { sql } from "drizzle-orm";
// Drizzle core imports
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Common timestamp fields used across all tables
export const timestamps = {
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
};

// Common ID field used across all tables
export const idField = {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
};

// Common status field used in many tables
export const statusField = {
  status: text("status").notNull().default("active"),
};
