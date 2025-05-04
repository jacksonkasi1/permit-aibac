import { config } from "dotenv";
import { seedTestUsers } from "./seed";

// Load environment variables
config();

/**
 * Test setup script for Clerk integration
 * 
 * This script performs the following:
 * 1. Seeds test users (admin, doctor, patient, etc.)
 * 2. Logs success/failure of each step
 * 
 * Usage:
 * ```
 * bun packages/clerk/src/test-setup.ts
 * ```
 */
async function testSetup() {
  console.log("Starting Clerk integration test setup...");
  
  try {
    // Step 1: Seed test users
    console.log("\n🧑‍💻 Step 1: Seeding test users...");
    await seedTestUsers();
    console.log("✅ Test users seeded successfully");
    
    // Print test user credentials
    console.log("\n🔑 Test User Credentials 🔑");
    console.log("----------------------------");
    console.log("Admin Account");
    console.log("  Username: admin@medicalai.com");
    console.log("  Password: 2025DEVChallenge");
    console.log("\nDoctor Account");
    console.log("  Username: doctor@medicalai.com");
    console.log("  Password: 2025DEVChallenge");
    console.log("\nPatient Account");
    console.log("  Username: patient@medicalai.com");
    console.log("  Password: 2025DEVChallenge");
    console.log("\nRegular User Account");
    console.log("  Username: newuser@medicalai.com");
    console.log("  Password: 2025DEVChallenge");
    console.log("----------------------------");
    
    console.log("\n✅ Test setup completed successfully!");
    console.log("\n🚀 Next steps:");
    console.log("1. Start the application: pnpm run dev");
    console.log("2. Sign in with one of the test accounts above");
    console.log("3. Verify that role-based access controls are working correctly");
  } catch (error) {
    console.error("❌ Test setup failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Run the test setup if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testSetup().catch((error) => {
    console.error("Test setup failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  });
} 