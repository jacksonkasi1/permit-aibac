import { sql } from "drizzle-orm";
// Common fields for reuse in multiple tables
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const standardColumns = {
  id: uuid("id")
    .notNull()
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
};
