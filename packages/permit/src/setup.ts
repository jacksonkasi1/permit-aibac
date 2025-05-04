import { config } from "dotenv";
import { Permit } from "permitio";
import { ResourceConfig, RoleConfig } from "./types";
import { db, eq, tbl_roles } from "@repo/db";

// Load environment variables
config();

console.log("Starting Permit.io setup...");

// Initialize Permit.io client
const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL || "https://cloudpdp.api.permit.io",
  token: process.env.PERMIT_API_KEY || "",
  // Add debug logging
  log: {
    level: "debug",
  },
  // Optional: throw on network errors
  throwOnError: true,
});

// Define all resources from PERMIT-TABLE.md
const resources: ResourceConfig[] = [
  {
    key: "medicalRecord",
    name: "Medical Record",
    actions: {
      view: { name: "View" },
      create: { name: "Create" },
      update: { name: "Update" },
      delete: { name: "Delete" },
      share: { name: "Share" },
    },
  },
  {
    key: "prescription",
    name: "Prescription",
    actions: {
      view: { name: "View" },
      create: { name: "Create" },
      update: { name: "Update" },
    },
    relations: {
      parent: "medicalRecord",
    },
  },
  {
    key: "appointment",
    name: "Appointment",
    actions: {
      view: { name: "View" },
      create: { name: "Create" },
      update: { name: "Update" },
    },
  },
  {
    key: "diagnosis",
    name: "Diagnosis",
    actions: {
      view: { name: "View" },
      create: { name: "Create" },
      update: { name: "Update" },
    },
    relations: {
      parent: "medicalRecord",
    },
  },
  {
    key: "insurance",
    name: "Insurance",
    actions: {
      view: { name: "View" },
      update: { name: "Update" },
    },
  },
  {
    key: "chat",
    name: "Chat",
    actions: {
      view: { name: "View" },
      create: { name: "Create" },
    },
  },
  {
    key: "ragQuery",
    name: "RAG Query",
    actions: {
      search: { name: "Search" },
    },
  },
  {
    key: "aiResponse",
    name: "AI Response",
    actions: {
      view: { name: "View" },
      mask: { name: "Mask" },
    },
  },
  {
    key: "auditLog",
    name: "Audit Log",
    actions: {
      view: { name: "View" },
    },
  },
  {
    key: "notification",
    name: "Notification",
    actions: {
      view: { name: "View" },
    },
  },
];

// Define all roles from PERMIT-TABLE.md
const roles: RoleConfig[] = [
  {
    key: "admin",
    name: "Admin",
    description: "System administrators with full access",
    permissions: [
      "medicalRecord:view",
      "medicalRecord:create",
      "medicalRecord:update",
      "medicalRecord:delete",
      "medicalRecord:share",
      "prescription:view",
      "prescription:create",
      "prescription:update",
      "appointment:view",
      "appointment:create",
      "appointment:update",
      "diagnosis:view",
      "diagnosis:create",
      "diagnosis:update",
      "insurance:view",
      "insurance:update",
      "chat:view",
      "chat:create",
      "ragQuery:search",
      "aiResponse:view",
      "aiResponse:mask",
      "auditLog:view",
      "notification:view",
    ],
  },
  {
    key: "doctor",
    name: "Doctor",
    description: "Medical professionals with access to patient records",
    permissions: [
      "medicalRecord:view",
      "medicalRecord:update",
      "prescription:view",
      "prescription:create",
      "prescription:update",
      "appointment:view",
      "appointment:create",
      "appointment:update",
      "diagnosis:view",
      "diagnosis:create",
      "diagnosis:update",
      "insurance:view",
      "chat:view",
      "chat:create",
      "ragQuery:search",
      "aiResponse:view",
    ],
  },
  {
    key: "patient",
    name: "Patient",
    description: "End-users accessing their own medical information",
    permissions: [
      "medicalRecord:view",
      "appointment:view",
      "appointment:create",
      "prescription:view",
      "diagnosis:view",
      "insurance:view",
      "chat:view",
      "chat:create",
      "ragQuery:search",
      "aiResponse:view",
    ],
  },
  {
    key: "researcher",
    name: "Researcher",
    description: "Anonymized data access for medical research",
    permissions: ["ragQuery:search", "aiResponse:view"],
  },
];

// Main setup function
async function setup() {
  try {
    console.log("Starting resources and permissions configuration...");

    // Create resources first (they're needed for roles)
    await createResources();

    // Create roles with permissions
    await createRoles();

    // Create resource relations for ReBAC
    await createResourceRelations();

    // Ensure database roles are in sync with Permit.io
    await syncDatabaseRoles();

    console.log("Permit.io setup completed successfully");
  } catch (error) {
    console.error("Permit.io setup failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Create resources
async function createResources() {
  console.log("Creating resources...");

  for (const resource of resources) {
    try {
      // Check if resource exists
      let resourceExists = false;
      try {
        await permit.api.resources.get(resource.key);
        resourceExists = true;
      } catch (err) {
        console.log(`Resource ${resource.key} does not exist yet. Creating...`);
      }

      if (!resourceExists) {
        // The newer API uses resource instead of resources
        await permit.api.resources.create(resource);
        console.log(`Created resource: ${resource.key}`);
      } else {
        console.log(`Resource ${resource.key} already exists. Skipping.`);
      }
    } catch (error) {
      console.error(`Error creating resource ${resource.key}:`, error);
    }
  }
}

// Create roles
async function createRoles() {
  console.log("Creating roles...");

  for (const role of roles) {
    try {
      // Check if role exists
      let roleExists = false;
      try {
        await permit.api.roles.get(role.key);
        roleExists = true;
      } catch (err) {
        console.log(`Role ${role.key} does not exist yet. Creating...`);
      }

      if (!roleExists) {
        await permit.api.roles.create(role);
        console.log(`Created role: ${role.key}`);
      } else {
        console.log(`Role ${role.key} already exists. Updating permissions...`);

        // Update permissions
        await permit.api.roles.update(role.key, {
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        });
      }
    } catch (error) {
      console.error(`Error creating/updating role ${role.key}:`, error);
    }
  }
}

// Create resource relations for ReBAC
async function createResourceRelations() {
  console.log("Creating resource relations...");

  try {
    // Prescription is a child of medicalRecord
    try {
      await permit.api.resourceRelations.create("prescription", {
        key: "parent",
        name: "Parent",
        subject_resource: "medicalRecord",
      });
      console.log("Created 'parent' relation for prescription");
    } catch (error: any) {
      // If it's a 409 conflict (already exists), just log and continue
      if (error?.originalError?.status === 409) {
        console.log("Relation 'parent' already exists for prescription");
      } else {
        throw error;
      }
    }

    // Diagnosis is a child of medicalRecord
    try {
      await permit.api.resourceRelations.create("diagnosis", {
        key: "parent",
        name: "Parent",
        subject_resource: "medicalRecord",
      });
      console.log("Created 'parent' relation for diagnosis");
    } catch (error: any) {
      // If it's a 409 conflict (already exists), just log and continue
      if (error?.originalError?.status === 409) {
        console.log("Relation 'parent' already exists for diagnosis");
      } else {
        throw error;
      }
    }

    console.log("Resource relations setup completed");
  } catch (error) {
    console.error("Error creating resource relations:", error);
  }
}

/**
 * Synchronize roles from Permit.io to the database
 */
async function syncDatabaseRoles() {
  console.log("Syncing roles to database...");
  
  try {
    // For each role in our configuration
    for (const role of roles) {
      // Check if role exists in database
      const existingRoles = await db
        .select()
        .from(tbl_roles)
        .where(eq(tbl_roles.key, role.key));

      const roleExists = existingRoles.length > 0;
      
      if (!roleExists) {
        // Create the role in the database
        await db.insert(tbl_roles).values({
          key: role.key,
          name: role.name,
        });
        console.log(`Created role in database: ${role.key}`);
      } else {
        // Update the existing role in the database
        await db
          .update(tbl_roles)
          .set({
            name: role.name,
          })
          .where(eq(tbl_roles.key, role.key));
        console.log(`Updated role in database: ${role.key}`);
      }
    }
    
    console.log("Database role sync completed");
  } catch (error) {
    console.error("Error syncing roles to database:", error);
    throw error;
  }
}

// Export setup function
export { setup };

// If this file is run directly, execute setup
if (typeof require !== 'undefined' && require.main === module) {
  setup().catch((error) => {
    console.error("Setup failed:", error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  });
}
