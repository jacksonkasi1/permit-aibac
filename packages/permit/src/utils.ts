import { permit } from "./index";
import { ResourceAttributes, UserAttributes } from "./types";

/**
 * Authorize a RAG (Retrieval Augmented Generation) query based on user permissions
 */
export async function authorizeRagQuery(
  userId: string,
  query: string,
  resourceType: string,
): Promise<{
  allowed: boolean;
  filters?: Record<string, any>;
}> {
  try {
    // Use the correct permit.check() format
    const canSearch = await permit.check({
      user: userId,
      action: "search",
      resource: resourceType,
    });

    if (!canSearch) {
      return { allowed: false };
    }

    // Get user attributes for filtering
    const userAttrs = await getUserAttributes(userId);

    // Create permission filters based on user attributes
    const filters = createPermissionFilters(userAttrs);

    return {
      allowed: true,
      filters,
    };
  } catch (error) {
    console.error("Error authorizing RAG query:", error);
    return { allowed: false };
  }
}

/**
 * Filter an AI response based on user permissions
 */
export async function filterAIResponse(
  userId: string,
  response: string,
  resourceType: string,
): Promise<string> {
  try {
    // Get user permissions using role assignments
    const permissions = await getUserPermissions(userId);

    // Apply field-level masking based on permissions
    return applyFieldMasking(response, permissions);
  } catch (error) {
    console.error("Error filtering AI response:", error);
    return "[Error: Unable to process response]";
  }
}

/**
 * Get user attributes for filtering
 * Implementation depends on Permit.io API structure
 */
async function getUserAttributes(userId: string): Promise<Record<string, any>> {
  try {
    // Using the current Permit.io API structure
    const user = await permit.api.users.get(userId);
    return user?.attributes || {};
  } catch (error) {
    console.error("Error getting user attributes:", error);
    return {};
  }
}

/**
 * Get user permissions by retrieving role assignments
 * Implementation depends on Permit.io API structure
 */
async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Get the user's role assignments
    const roleAssignments = await permit.api.roleAssignments.list({ user: userId });

    let permissions: string[] = [];

    // For each role, get its permissions
    if (roleAssignments && Array.isArray(roleAssignments)) {
      for (const assignment of roleAssignments) {
        if (assignment.role) {
          const roleData = await permit.api.roles.get(assignment.role);
          if (roleData?.permissions) {
            permissions = [...permissions, ...roleData.permissions];
          }
        }
      }
    }

    return permissions;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

/**
 * Create filters for vector DB queries based on user attributes
 */
function createPermissionFilters(userAttrs: Record<string, any> = {}): Record<string, any> {
  const filters: Record<string, any> = {};

  // Apply department filter if user has department restriction
  if (userAttrs.department) {
    filters.department = userAttrs.department;
  }

  // Apply sensitivity level filter based on clearance
  if (userAttrs.clearance !== undefined) {
    // Map clearance levels to sensitivity
    if (userAttrs.clearance < 3) {
      filters.sensitivity = "Normal";
    } else if (userAttrs.clearance < 5) {
      filters.sensitivity = ["Normal", "Sensitive"];
    }
    // Clearance 5 can access all sensitivity levels
  }

  // Filter by specialization if applicable
  if (userAttrs.specialization) {
    filters.specialization = userAttrs.specialization;
  }

  return filters;
}

/**
 * Apply field-level masking to AI responses based on permissions
 */
function applyFieldMasking(response: string, permissions: string[]): string {
  // This is a simplified implementation
  // In a real-world scenario, you would parse the response,
  // check each field against permissions, and mask sensitive data

  let maskedResponse = response;

  // Example: Mask insurance IDs if user doesn't have permission
  if (!permissions.includes("insurance:view")) {
    maskedResponse = maskInsuranceIds(maskedResponse);
  }

  // Example: Mask detailed diagnoses if user doesn't have the right permission
  if (!permissions.includes("diagnosis:view")) {
    maskedResponse = maskDiagnosisDetails(maskedResponse);
  }

  return maskedResponse;
}

/**
 * Mask insurance IDs in text
 */
function maskInsuranceIds(text: string): string {
  // Example implementation - would use regex in real world
  return text.replace(/insurance id: \w+/gi, "insurance id: [REDACTED]");
}

/**
 * Mask detailed diagnosis information
 */
function maskDiagnosisDetails(text: string): string {
  // Example implementation - would use NLP/regex in real world
  return text.replace(
    /diagnosed with ([^\.]+)/gi,
    "diagnosed with [SENSITIVE MEDICAL INFORMATION]",
  );
}

/**
 * Log authorization attempts for audit and compliance
 */
export async function logAccessAttempt(
  userId: string,
  action: string,
  resource: string,
  allowed: boolean,
  context: Record<string, any> = {},
): Promise<void> {
  try {
    // In a real implementation, this would write to a secure audit log
    console.log({
      timestamp: new Date(),
      userId,
      action,
      resource,
      allowed,
      context,
    });
  } catch (error) {
    console.error("Error logging access attempt:", error);
  }
}
