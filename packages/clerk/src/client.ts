import { clerkClient } from "@clerk/clerk-sdk-node";
import { ClerkUser, RegistrationData, UserRole } from "./types";

/**
 * Create a user in Clerk
 */
export async function createClerkUser(data: RegistrationData): Promise<ClerkUser | null> {
  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [data.email],
      password: data.password,
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      publicMetadata: {
        role: data.role || "patient",
        department: data.department,
        specialization: data.specialization,
        clearance: data.clearance,
      },
    });

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || data.email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: (user.publicMetadata.role as UserRole) || "patient",
      department: user.publicMetadata.department as string | undefined,
      specialization: user.publicMetadata.specialization as string | undefined,
      clearance: user.publicMetadata.clearance as number | undefined,
      metadata: user.publicMetadata as any,
    };
  } catch (error) {
    console.error("Error creating Clerk user:", error);
    return null;
  }
}

/**
 * Get a user from Clerk by ID
 */
export async function getClerkUser(userId: string): Promise<ClerkUser | null> {
  try {
    const user = await clerkClient.users.getUser(userId);

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: (user.publicMetadata.role as UserRole) || "patient",
      department: user.publicMetadata.department as string | undefined,
      specialization: user.publicMetadata.specialization as string | undefined,
      clearance: user.publicMetadata.clearance as number | undefined,
      metadata: user.publicMetadata as any,
    };
  } catch (error) {
    console.error("Error getting Clerk user:", error);
    return null;
  }
}

/**
 * Update a user's role in Clerk
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    return false;
  }
}

/**
 * Update a user's metadata in Clerk
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>,
): Promise<boolean> {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: metadata,
    });
    return true;
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return false;
  }
}
