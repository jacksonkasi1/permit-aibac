/* From https://clerk.com/docs/webhooks/sync-data */

import { Hono } from "hono";

import { WebhookEvent } from "@clerk/backend";
import { db, eq, tbl_users } from "@repo/db";
import { logger } from "@repo/logs";
import { permit } from "@repo/permit";
import { syncUserToDatabase, syncUserRoles } from "@repo/clerk";
import { Webhook } from "svix";

const webhookRoutes = new Hono().post("/", async (c) => {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);
  // Get headers
  const svix_id = c.req.header("svix-id");
  const svix_timestamp = c.req.header("svix-timestamp");
  const svix_signature = c.req.header("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return c.text("Error: Missing Svix headers", 400);
  }

  // Get body
  const payload = await c.req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Error: Could not verify webhook:", err);
    return c.text("Error: Verification error", 400);
  }

  // Handle user events
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, public_metadata } = evt.data;
    const primaryEmailAddress = email_addresses?.[0]?.email_address;
    
    if (!primaryEmailAddress) {
      return c.text("No email address found", 400);
    }

    try {
      // Extract metadata from Clerk user
      const firstName = evt.data.first_name || "";
      const lastName = evt.data.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Get role from metadata or default to "patient"
      const userRole = (public_metadata?.role as string) || "patient";
      
      // Special case for new users - use our sync utilities
      if (evt.type === "user.created") {
        logger.info(`New user created: ${id} (${primaryEmailAddress})`);
        
        // 1. Sync user to database
        const dbUserId = await syncUserToDatabase(id);
        
        if (!dbUserId) {
          logger.error(`Failed to sync user to database: ${id}`);
          return c.text("Error: Database sync failed", 500);
        }
        
        // 2. Sync user roles to database and Permit.io
        const roleSynced = await syncUserRoles(dbUserId, id, userRole as any);
        
        if (!roleSynced) {
          logger.error(`Failed to sync roles for user: ${id}`);
          return c.text("Error: Role sync failed", 500);
        }
        
        logger.info(`User created and roles assigned: ${primaryEmailAddress} (${userRole})`);
      } 
      // For updates, just make sure the database is in sync
      else {
        // Find user in database
        const existingUser = await db
          .select()
          .from(tbl_users)
          .where(eq(tbl_users.email, primaryEmailAddress));
        
        if (existingUser.length === 0) {
          // User doesn't exist in our DB yet, create it
          const dbUserId = await syncUserToDatabase(id);
          if (dbUserId) {
            await syncUserRoles(dbUserId, id, userRole as any);
            logger.info(`User updated and synced: ${primaryEmailAddress} (${userRole})`);
          }
        } else {
          // Update existing user
          await db
            .update(tbl_users)
            .set({
              name: fullName,
              role: userRole,
            })
            .where(eq(tbl_users.email, primaryEmailAddress));
          
          logger.info(`User updated: ${primaryEmailAddress}`);
        }
      }
    } catch (error) {
      logger.error("Error processing webhook:", error);
      return c.text("Error: Database operation failed", 500);
    }
  }

  return c.json({ message: "webhook received" }, 200);
});

export { webhookRoutes };
