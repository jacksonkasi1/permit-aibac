import { config } from "dotenv";
import { registerUser } from "./registration";
import { seedTestUsers } from "./seed";
import { UserRole } from "./types";

// Load environment variables
config();

/**
 * Example implementation of the Clerk integration
 * 
 * This example demonstrates how to:
 * 1. Register a new user
 * 2. Seed test users
 * 
 * Usage:
 * ```
 * bun packages/clerk/src/example.ts
 * ```
 */
async function example() {
  console.log("Starting Clerk integration example...");
  
  try {
    // Example 1: Register a new user
    console.log("\n📝 Example 1: Registering a new user");
    
    const userData = {
      email: "example@medicalai.com",
      password: "SecurePassword123!",
      name: "Example User",
      role: "patient" as UserRole,
    };
    
    console.log(`Registering user: ${userData.email}`);
    const result = await registerUser(userData);
    
    if (result.success) {
      console.log(`✅ User registered successfully with ID: ${result.userId}`);
    } else {
      console.error(`❌ Registration failed: ${result.error}`);
    }
    
    // Example 2: Seed test users
    console.log("\n👥 Example 2: Seeding test users");
    console.log("This will create predefined test users with known credentials");
    
    const shouldSeed = process.env.SEED_TEST_USERS === "true";
    
    if (shouldSeed) {
      await seedTestUsers();
      console.log("✅ Test users seeded successfully");
    } else {
      console.log("⏭️ Skipping test user creation (set SEED_TEST_USERS=true to enable)");
    }
    
    console.log("\n✅ Example completed!");
    console.log("\n🔑 Available test credentials:");
    console.log("Admin: admin@medicalai.com / 2025DEVChallenge");
    console.log("Doctor: doctor@medicalai.com / 2025DEVChallenge");
    console.log("Patient: patient@medicalai.com / 2025DEVChallenge");
    console.log("New User: newuser@medicalai.com / 2025DEVChallenge");
  } catch (error) {
    console.error("❌ Example failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Run the example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  example().catch((error) => {
    console.error("Example failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  });
} 