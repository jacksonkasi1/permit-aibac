import { Hono } from "hono";
import { cors } from "hono/cors";

import { postRoutes } from "@/modules/posts";

import { chatRoutes } from "@/modules/chat/chat.router";
import { webhookRoutes } from "@/modules/webhooks/webhook.routes";
import { errorHandler } from "@/pkg/middleware/error";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

app.use("*", logger());

const corsOrigins = ["http://localhost:3000", "https://localhost:3000"];
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "X-Vercel-AI-Data-Stream"],
    exposeHeaders: ["Content-Length", "X-Vercel-AI-Data-Stream"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", prettyJSON());

app.get("/health", (c) => {
  return c.text("OK");
});

app.onError(errorHandler);

const routes = app
  .basePath("/api")
  .route("/webhooks", webhookRoutes)
  .route("/posts", postRoutes)
  .route("/chat", chatRoutes);

export type AppType = typeof routes;

export default {
  port: 3004,
  fetch: app.fetch,
  idleTimeout: 30,
};
