import { createClerkUser } from "./client";
import { syncUserToDatabase, syncUserRoles } from "./sync";
import { TestUser } from "./types";
import { config } from "dotenv";

// Load environment variables
config();

// Default test users
const testUsers: TestUser[] = [
  {
    email: "admin@medicalai.com",
    password: "2025DEVChallenge",
    name: "Admin User",
    role: "admin",
    department: "Administration",
    clearance: 10,
  },
  {
    email: "doctor@medicalai.com",
    password: "2025DEVChallenge",
    name: "Doctor Smith",
    role: "doctor",
    department: "Cardiology",
    specialization: "Cardiology",
    clearance: 8,
  },
  {
    email: "patient@medicalai.com",
    password: "2025DEVChallenge",
    name: "John Patient",
    role: "patient",
    clearance: 1,
  },
  {
    email: "researcher@medicalai.com",
    password: "2025DEVChallenge",
    name: "Research Analyst",
    role: "researcher",
    department: "Research",
    clearance: 5,
  },
  {
    email: "newuser@medicalai.com",
    password: "2025DEVChallenge",
    name: "New User",
    role: "patient",
    clearance: 1,
  },
];

/**
 * Verify required environment variables are set
 */
function verifyEnvironment(): boolean {
  const requiredVars = [
    'CLERK_SECRET_KEY',
    'PERMIT_API_KEY',
    'DATABASE_URL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set these variables in your .env file');
    return false;
  }
  
  return true;
}

/**
 * Seed test users in development environment
 */
export async function seedTestUsers(): Promise<void> {
  console.log("Seeding test users...");
  
  // Verify environment variables
  if (!verifyEnvironment()) {
    console.error("Environment setup incomplete. Aborting.");
    return;
  }
  
  for (const userData of testUsers) {
    try {
      // Check if already created
      console.log(`Creating user: ${userData.email}`);
      
      // Create Clerk user
      const clerkUser = await createClerkUser(userData);
      
      if (!clerkUser) {
        console.error(`Failed to create Clerk user: ${userData.email}`);
        continue;
      }
      
      // Sync to database
      const dbUserId = await syncUserToDatabase(clerkUser.id);
      
      if (!dbUserId) {
        console.error(`Failed to sync user to database: ${userData.email}`);
        continue;
      }
      
      // Sync roles
      const roleSynced = await syncUserRoles(dbUserId, clerkUser.id, userData.role);
      
      if (!roleSynced) {
        console.error(`Failed to sync roles for user: ${userData.email}`);
        continue;
      }
      
      console.log(`✅ Successfully created test user: ${userData.email}`);
    } catch (error) {
      console.error(`Error creating test user ${userData.email}:`, error);
    }
  }
  
  console.log("Test user seeding completed");
}

// Direct script execution
if (typeof require !== 'undefined' && require.main === module) {
  seedTestUsers().catch((error) => {
    console.error("Error seeding test users:", error);
    process.exit(1);
  });
}
