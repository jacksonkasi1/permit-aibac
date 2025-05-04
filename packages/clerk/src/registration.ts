import { createClerkUser } from "./client";
import { syncUserToDatabase, syncUserRoles } from "./sync";
import { RegistrationData } from "./types";

/**
 * Register a new user with Clerk, sync to database and Permit.io
 */
export async function registerUser(
  data: RegistrationData,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // 1. Create user in Clerk
    const clerkUser = await createClerkUser(data);

    if (!clerkUser) {
      return {
        success: false,
        error: "Failed to create user in Clerk",
      };
    }

    // 2. Sync user to database
    const dbUserId = await syncUserToDatabase(clerkUser.id);

    if (!dbUserId) {
      return {
        success: false,
        error: "Failed to sync user to database",
      };
    }

    // 3. Sync user roles to database and Permit.io
    const roleSynced = await syncUserRoles(dbUserId, clerkUser.id, clerkUser.role);

    if (!roleSynced) {
      return {
        success: false,
        error: "Failed to sync user roles",
      };
    }

    return {
      success: true,
      userId: clerkUser.id,
    };
  } catch (error) {
    console.error("Error during user registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during registration",
    };
  }
}
