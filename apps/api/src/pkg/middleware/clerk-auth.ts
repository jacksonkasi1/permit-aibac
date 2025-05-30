/**
 * Authentication middleware for Clerk integration with Hono
 * Provides authentication flow and utility functions
 */
import { createClerkClient } from "@clerk/backend";
import type { ClerkClient, ClerkOptions } from "@clerk/backend";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";

/**
 * Type representing the authentication object returned by Clerk
 */
type ClerkAuth = ReturnType<Awaited<ReturnType<ClerkClient["authenticateRequest"]>>["toAuth"]>;

declare module "hono" {
  interface ContextVariableMap {
    clerk: ClerkClient;
    clerkAuth: ClerkAuth;
  }
}

/**
 * Environment variables required for Clerk configuration
 */
type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_API_URL?: string;
  CLERK_API_VERSION?: string;
  NODE_ENV?: string;
};

/**
 * Retrieves the authentication object from the request context
 */
export const getAuth = (c: Context): ClerkAuth => c.get("clerkAuth");

/**
 * Gets the authenticated user ID or throws an unauthorized error
 * @throws {Error} When no authenticated user is found
 */
export const getUserId = (c: Context): string => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    throw new Error("Unauthorized");
  }
  return auth.userId;
};

/**
 * Middleware that adds Clerk authentication to the request
 */
export const auth = (options?: ClerkOptions): MiddlewareHandler => {
  return async (c, next) => {
    try {
      const clerkEnv = env<ClerkEnv>(c);
      const isDevelopment = clerkEnv.NODE_ENV === 'development';

      // Get configuration from options or environment
      const {
        secretKey = clerkEnv.CLERK_SECRET_KEY || (isDevelopment ? "dev_fallback_key" : ""),
        publishableKey = clerkEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || (isDevelopment ? "dev_fallback_key" : ""),
        apiUrl = clerkEnv.CLERK_API_URL,
        apiVersion = clerkEnv.CLERK_API_VERSION,
        ...rest
      } = options || {};

      // Validate required configuration
      if (!secretKey) {
        throw new Error("Missing Clerk Secret key");
      }

      if (!publishableKey) {
        throw new Error("Missing Clerk Publishable key");
      }

      // Create clerk client with configuration
      const clerkClient = createClerkClient({
        secretKey,
        publishableKey,
        apiUrl,
        apiVersion,
        ...rest,
      });

      // Authenticate the request
      const requestState = await clerkClient.authenticateRequest(c.req.raw, {
        secretKey,
        publishableKey,
        ...rest,
      });

      // Handle authentication headers and redirects
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => c.res.headers.append(key, value));

        const locationHeader = requestState.headers.get("location");
        if (locationHeader) {
          return c.redirect(locationHeader, 307);
        } else if (requestState.status === "handshake") {
          throw new Error("Clerk: unexpected handshake without redirect");
        }
      }

      // Set auth data in context
      c.set("clerkAuth", requestState.toAuth());
      c.set("clerk", clerkClient);

      await next();
    } catch (error) {
      console.error("Clerk authentication error:", error);
      return c.json({
        error: "Authentication error",
        message: error instanceof Error ? error.message : "Unknown authentication error",
      }, 500);
    }
  };
};

/**
 * Middleware that requires the user to be authenticated
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized", message: "Authentication required" }, 401);
    }
    await next();
  } catch (error) {
    console.error("Authorization error:", error);
    return c.json({
      error: "Authorization error",
      message: error instanceof Error ? error.message : "Unknown authorization error",
    }, 401);
  }
};
