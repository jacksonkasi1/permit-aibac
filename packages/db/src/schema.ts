import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { lifecycleDates } from "./util/lifecycle-dates";
export const users = pgTable("users", {
  userId: varchar("user_id", { length: 128 }).primaryKey(),
  // Add more clerk fields you want to sync here
  email: text("email").notNull(),
  ...lifecycleDates,
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  userId: varchar("user_id", { length: 128 })
    .notNull()
    .references(() => users.userId),
  ...lifecycleDates,
});
