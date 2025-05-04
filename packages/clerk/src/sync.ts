import { UserRole } from "./types";
import { db, eq, NewUser, tbl_roles, tbl_user_roles, tbl_users } from "@repo/db";
import { permit } from "@repo/permit";
import { getClerkUser } from "./client";

/**
 * Sync a user from Clerk to the database
 */
export async function syncUserToDatabase(clerkUserId: string): Promise<string | null> {
  try {
    const clerkUser = await getClerkUser(clerkUserId);
    if (!clerkUser) {
      throw new Error(`User not found in Clerk: ${clerkUserId}`);
    }

    // Check if user already exists in the database
    const existingUser = await db
      .select()
      .from(tbl_users)
      .where(eq(tbl_users.email, clerkUser.email));

    if (existingUser.length > 0 && existingUser[0]) {
      const user = existingUser[0];
      // Update existing user
      await db
        .update(tbl_users)
        .set({
          name: clerkUser.name,
          role: clerkUser.role,
          department: clerkUser.department,
          clearance: clerkUser.clearance,
          specialization: clerkUser.specialization,
        })
        .where(eq(tbl_users.id, user.id));
      
      return user.id;
    } else {
      // Create new user
      const newUser: NewUser = {
        email: clerkUser.email,
        name: clerkUser.name,
        role: clerkUser.role,
        department: clerkUser.department,
        clearance: clerkUser.clearance,
        specialization: clerkUser.specialization,
      };

      const insertResult = await db.insert(tbl_users).values(newUser).returning();
      if (!insertResult || insertResult.length === 0 || !insertResult[0]) {
        throw new Error("Failed to insert user into database");
      }
      
      return insertResult[0].id;
    }
  } catch (error) {
    console.error("Error syncing user to database:", error);
    return null;
  }
}

/**
 * Sync user roles to the database and Permit.io
 */
export async function syncUserRoles(
  userId: string, 
  clerkUserId: string, 
  role: UserRole
): Promise<boolean> {
  try {
    // 1. Get role_id from the database
    const roles = await db.select().from(tbl_roles).where(eq(tbl_roles.key, role));
    
    if (!roles || roles.length === 0 || !roles[0]) {
      throw new Error(`Role not found: ${role}`);
    }
    
    const roleRecord = roles[0];
    const roleId = roleRecord.id;
    
    // 2. Create or update user_role in the database
    const existingRoles = await db
      .select()
      .from(tbl_user_roles)
      .where(eq(tbl_user_roles.user_id, userId));
    
    if (existingRoles.length === 0) {
      // Insert new role
      await db.insert(tbl_user_roles).values({
        user_id: userId,
        role_id: roleId,
      });
    } else {
      // Update existing role
      await db
        .update(tbl_user_roles)
        .set({ role_id: roleId })
        .where(eq(tbl_user_roles.user_id, userId));
    }
    
    // 3. Sync with Permit.io
    const users = await db.select().from(tbl_users).where(eq(tbl_users.id, userId));
    
    if (!users || users.length === 0 || !users[0]) {
      throw new Error(`User not found in database: ${userId}`);
    }
    
    // Create or update user in Permit.io
    const permitUser = await syncUserToPermit(clerkUserId, users[0], role);
    
    return permitUser !== null;
  } catch (error) {
    console.error("Error syncing user roles:", error);
    return false;
  }
}

/**
 * Sync a user to Permit.io
 */
export async function syncUserToPermit(
  clerkUserId: string, 
  dbUser: any, 
  role: UserRole
): Promise<any> {
  try {
    // Create or update user in Permit.io
    const permitUser = await permit.api.users.sync({
      key: clerkUserId,
      email: dbUser.email,
      first_name: dbUser.name.split(" ")[0],
      last_name: dbUser.name.split(" ").slice(1).join(" ") || "",
      attributes: {
        department: dbUser.department,
        role: dbUser.role,
        clearance: dbUser.clearance,
        specialization: dbUser.specialization,
      },
    });
    
    // Assign role to user in Permit.io
    await permit.api.users.assignRole({
      user: clerkUserId,
      role,
      tenant: "default", // Use tenant if your Permit.io setup has multi-tenancy
    });
    
    return permitUser;
  } catch (error) {
    console.error("Error syncing user to Permit.io:", error);
    return null;
  }
}
