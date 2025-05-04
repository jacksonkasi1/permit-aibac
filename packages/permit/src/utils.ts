import { permit } from "./index";
import { ResourceAttributes, UserAttributes } from "./types";

/**
 * Classify and authorize a prompt to determine if it should be allowed
 * Based on the example from: https://www.permit.io/blog/ai-prompt-classification-for-access-control
 */
export async function classifyPrompt(
  userId: string,
  prompt: string
): Promise<{
  allowed: boolean;
  reason?: string;
  classification?: string;
  filters?: Record<string, any>;
}> {
  try {
    // Simple classification of prompt intent
    // In production, this would use a more sophisticated classification model
    const classification = await classifyPromptIntent(prompt);
    console.log(`Prompt classified as: ${classification}`);

    // Get user attributes for context
    const userAttrs = await getUserAttributes(userId);
    
    // Check if this classification of prompt is allowed for this user
    const allowed = await permit.check(
      userId, 
      classification, 
      "aiPrompt",
      { context: { prompt, classification } }
    );

    if (!allowed) {
      return { 
        allowed: false, 
        classification,
        reason: `User not authorized for ${classification} operations` 
      };
    }

    // Check for banned patterns/keywords (simple implementation)
    const bannedPatterns = getBannedPatterns(userAttrs.role);
    if (containsBannedPatterns(prompt, bannedPatterns)) {
      return { 
        allowed: false, 
        classification,
        reason: "Prompt contains prohibited content"
      };
    }

    // Create filters for vector DB or AI response based on user attributes
    const filters = createPermissionFilters(userAttrs);

    return {
      allowed: true,
      classification,
      filters
    };
  } catch (error) {
    console.error("Error classifying prompt:", error);
    return { 
      allowed: false,
      reason: "Error during prompt classification" 
    };
  }
}

/**
 * Classify a prompt's intent into an action type
 * This is a simplified implementation - in production use a proper ML model
 */
async function classifyPromptIntent(prompt: string): Promise<string> {
  const lowerPrompt = prompt.toLowerCase();
  
  // Simple pattern matching for demonstration
  if (lowerPrompt.includes("update") || 
      lowerPrompt.includes("modify") || 
      lowerPrompt.includes("change")) {
    return "update";
  }
  
  if (lowerPrompt.includes("delete") || 
      lowerPrompt.includes("remove") || 
      lowerPrompt.includes("erase")) {
    return "delete";
  }
  
  if (lowerPrompt.includes("create") || 
      lowerPrompt.includes("add") || 
      lowerPrompt.includes("new")) {
    return "create";
  }
  
  // Default to 'view' as the safest operation
  return "view";
}

/**
 * Get banned patterns based on user role
 */
function getBannedPatterns(role: string = "patient"): RegExp[] {
  const commonBannedPatterns = [
    /show me all patient(s)? data/i,
    /bypass (security|authentication|authorization)/i,
    /ignore (policy|restrictions|permissions)/i,
    /admin access/i,
    /\.exec\(|\.eval\(/i, // Code injection patterns
  ];

  // Add role-specific banned patterns
  if (role === "patient") {
    return [
      ...commonBannedPatterns,
      /other patients/i,
      /all (medical|health) records/i,
      /doctor('s)? notes/i,
      /system (admin|administrator|configuration)/i,
    ];
  }

  return commonBannedPatterns;
}

/**
 * Check if a prompt contains banned patterns
 */
function containsBannedPatterns(prompt: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(prompt));
}

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
    // Use the correct permit.check() format based on the latest permit.io API
    const canSearch = await permit.check(
      userId, 
      "search", 
      resourceType, 
      { context: { query } }
    );

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
