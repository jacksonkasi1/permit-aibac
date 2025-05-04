import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import * as schema from "./schema";

export type Post = InferSelectModel<typeof schema.posts>;
export type NewPost = InferInsertModel<typeof schema.posts>;

export const postInsertSchema = createInsertSchema(schema.posts).omit({ userId: true });
export const postSelectSchema = createSelectSchema(schema.posts);
