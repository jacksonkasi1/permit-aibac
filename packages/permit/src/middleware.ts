import { Context } from "hono";
import { permit } from "./index";
/**
 * Middleware for Hono API routes that checks permissions using Permit.io
 *
 * This middleware extracts user information, resource type, and action from requests
 * and uses Permit.io to perform authorization checks.
 */
export const permitMiddleware = async (c: Context, next: () => Promise<void>) => {
  try {
    // Extract user information from the request context
    // Assumes authentication middleware has already set the user
    const user = c.get("user") || {};

    // Extract resource type from the request path
    const resourceType = getResourceType(c.req.path);

    // Extract resource ID if applicable
    const resourceId = getResourceId(c.req.path);

    // Get resource attributes for context
    const resourceAttributes = await getResourceAttributes(resourceType, resourceId);

    // Map HTTP method to Permit action
    const action = mapMethodToAction(c.req.method);

    // Perform permission check using Permit.io
    const allowed = await permit.check({
      user: user.id,
      action,
      resource: resourceType,
      context: {
        // Include resource attributes for ABAC decisions
        attributes: resourceAttributes,
        // Include tenant for multi-tenant authorization
        tenant: user.tenant || "default",
      },
    });

    if (!allowed) {
      // Return standardized 403 response for unauthorized requests
      return c.json(
        {
          error: "Forbidden",
          message: "You don't have permission to perform this action",
        },
        403,
      );
    }

    // Proceed to the route handler if allowed
    await next();
  } catch (error) {
    // Log the error for debugging/monitoring
    console.error("Permit authorization error:", error);

    // Return standardized 500 response for errors
    return c.json(
      {
        error: "Authorization Error",
        message: "An error occurred during authorization",
      },
      500,
    );
  }
};

/**
 * Extract resource type from the request path
 */
function getResourceType(path: string): string {
  // Extract resource type from path segments
  // This implementation should be customized based on your API structure
  if (path.includes("/medical-records")) return "medicalRecord";
  if (path.includes("/prescriptions")) return "prescription";
  if (path.includes("/appointments")) return "appointment";
  if (path.includes("/diagnoses")) return "diagnosis";
  if (path.includes("/insurance")) return "insurance";
  if (path.includes("/chat")) return "chat";
  if (path.includes("/rag-query")) return "ragQuery";
  if (path.includes("/ai-response")) return "aiResponse";
  if (path.includes("/audit-logs")) return "auditLog";
  if (path.includes("/notifications")) return "notification";

  return "unknown";
}

/**
 * Extract resource ID from the request path
 */
function getResourceId(path: string): string | undefined {
  // Extract resource ID from path segments
  // This implementation should be customized based on your API structure
  const segments = path.split("/");

  // Assume the last segment is the ID if it looks like one
  const lastSegment = segments[segments.length - 1];

  // Check if the last segment is a valid ID (not empty and not a route name)
  if (lastSegment && !lastSegment.includes(".") && !Number.isNaN(Number(lastSegment))) {
    return lastSegment;
  }

  return undefined;
}

/**
 * Get resource attributes from the database or other sources
 * This function should be implemented to fetch actual attributes from your database
 */
async function getResourceAttributes(
  resourceType: string,
  resourceId?: string,
): Promise<Record<string, any>> {
  // This is a placeholder - implement actual attribute retrieval based on your data model
  // For example, query your database for resource metadata

  // For now, return an empty object
  return {};
}

/**
 * Map HTTP method to Permit action
 */
function mapMethodToAction(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "view";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "view";
  }
}
