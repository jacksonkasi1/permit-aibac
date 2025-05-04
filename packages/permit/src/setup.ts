import { config } from "dotenv";
import { Permit } from "permitio";
import { ResourceConfig, RoleConfig, ConditionSetConfig } from "./types";

// Load environment variables
config();

// Initialize Permit.io client
const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL || "https://cloudpdp.api.permit.io",
  token: process.env.PERMIT_API_KEY || "",
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

// Define ABAC conditions from PERMIT-TABLE.md
const conditionSets: ConditionSetConfig[] = [
  {
    key: "high_clearance_records",
    name: "High Clearance Records Access",
    conditions: {
      allOf: [
        {
          user: {
            clearance: {
              gte: 4,
            },
          },
        },
        {
          resource: {
            sensitivity: {
              eq: "Restricted",
            },
          },
        },
      ],
    },
  },
  {
    key: "department_specific_access",
    name: "Department Specific Access",
    conditions: {
      allOf: [
        {
          user: {
            department: {
              eq: "$resource.department",
            },
          },
        },
      ],
    },
  },
];

// User attribute configuration
const userAttributeConfig = {
  attributes: {
    department: {
      type: "string",
      description: "Medical department",
    },
    clearance: {
      type: "number",
      description: "Data access clearance level (1-5)",
    },
    specialization: {
      type: "string",
      description: "Medical specialization",
    },
    isBlocked: {
      type: "boolean",
      description: "User access restriction flag",
    },
  },
};

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
    // Patient owns MedicalRecord
    await permit.api.resourceRelations.create({
      resource: "medicalRecord",
      relation: "owner",
      subject_resource: "user",
    });

    // Doctor treats Patient
    await permit.api.resourceRelations.create({
      resource: "user",
      relation: "treating_physician",
      subject_resource: "user",
    });

    console.log("Created resource relations");
  } catch (error) {
    console.error("Error creating resource relations:", error);
  }
}

// Create condition sets for ABAC
async function createConditionSets() {
  console.log("Creating condition sets...");

  for (const conditionSet of conditionSets) {
    try {
      let conditionSetExists = false;
      try {
        await permit.api.conditionSets.get(conditionSet.key);
        conditionSetExists = true;
      } catch (err) {
        console.log(`Condition set ${conditionSet.key} does not exist yet. Creating...`);
      }

      if (!conditionSetExists) {
        await permit.api.conditionSets.create(conditionSet);
        console.log(`Created condition set: ${conditionSet.key}`);
      } else {
        console.log(`Condition set ${conditionSet.key} already exists. Updating...`);
        await permit.api.conditionSets.update(conditionSet.key, conditionSet);
      }
    } catch (error) {
      console.error(`Error creating condition set ${conditionSet.key}:`, error);
    }
  }
}

// Configure user attributes
async function configureUserAttributes() {
  console.log("Configuring user attributes...");

  try {
    await permit.api.usersConfig.setUserAttributeConfig(userAttributeConfig);
    console.log("User attributes configured");
  } catch (error) {
    console.error("Error configuring user attributes:", error);
  }
}

// Apply condition sets to permissions
async function applyConditionSets() {
  console.log("Applying condition sets to permissions...");

  try {
    // Apply high clearance condition to restricted medical records
    await permit.api.conditionSetRules.create({
      condition_set_key: "high_clearance_records",
      permission: {
        action: "view",
        resource: "medicalRecord",
      },
    });

    // Apply department condition to medical records
    await permit.api.conditionSetRules.create({
      condition_set_key: "department_specific_access",
      permission: {
        action: "view",
        resource: "medicalRecord",
      },
    });

    console.log("Applied condition sets to permissions");
  } catch (error) {
    console.error("Error applying condition sets:", error);
  }
}

// Main setup function
async function setup() {
  try {
    console.log("Starting Permit.io setup...");

    // Create resources first (they're needed for roles)
    await createResources();

    // Create roles with permissions
    await createRoles();

    // Create resource relations for ReBAC
    await createResourceRelations();

    // Configure user attributes for ABAC
    await configureUserAttributes();

    // Create condition sets for ABAC
    await createConditionSets();

    // Apply condition sets to permissions
    await applyConditionSets();

    console.log("Permit.io setup completed successfully");
  } catch (error) {
    console.error("Permit.io setup failed:", error);
    process.exit(1);
  }
}

// Execute setup
setup();
