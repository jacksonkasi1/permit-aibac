# Permit.io Authorization Implementation

This document outlines the authorization strategy for the Secure AI Medical System using Permit.io. Following best practices for implementing fine-grained authorization with RBAC, ABAC, and ReBAC models.

## 1. Resources

The system includes the following protectable resources:

### Medical Data Resources
- `MedicalRecord`: Patient medical histories, diagnoses, and treatments
- `Prescription`: Medication prescriptions and history
- `Appointment`: Doctor-patient appointment information
- `Diagnosis`: Medical diagnoses with detailed information
- `Insurance`: Patient insurance details

### System Resources
- `Chat`: AI conversation sessions and history
- `RAGQuery`: Vector search queries for retrieving medical information
- `AIResponse`: Generated responses from the AI system
- `AuditLog`: Records of all system interactions for compliance
- `Notification`: System notifications and alerts

Each resource supports a range of actions:

```typescript
// Example Resource Definition
await permit.api.resources.create({
  key: "medicalRecord",
  name: "Medical Record",
  actions: {
    view: {
      name: "View"
    },
    create: {
      name: "Create"
    },
    update: {
      name: "Update"
    },
    delete: {
      name: "Delete"
    },
    share: {
      name: "Share"
    }
  }
});
```

## 2. Roles

### Environment-level Roles

- `Admin`: System administrators with full access to all resources
- `Doctor`: Medical professionals with access to patient records
- `Patient`: End-users accessing their own medical information
- `Researcher`: Anonymized data access for medical research

### Resource-level Roles

- `MedicalRecord#Owner`: Full control over own medical records
- `MedicalRecord#Viewer`: Read-only access to medical records
- `MedicalRecord#Editor`: Can edit specific medical records
- `Appointment#Scheduler`: Can create and manage appointments
- `Chat#Participant`: Can participate in specific chat sessions

```typescript
// Example Role Definition
await permit.api.roles.create({
  key: "doctor",
  name: "Doctor",
  permissions: [
    "medicalRecord:view",
    "medicalRecord:update",
    "prescription:create",
    "prescription:view",
    "prescription:update",
    "appointment:view",
    "appointment:create",
    "appointment:update",
    "diagnosis:create",
    "diagnosis:view",
    "diagnosis:update",
    "chat:create",
    "chat:view",
  ],
});
```

## 3. Relationships

Relationships define how resources are connected, enabling permission derivation through ReBAC.

### Resource Relationships

- `Patient` owns `MedicalRecord` (owner relationship)
- `Doctor` treats `Patient` (treating physician relationship)
- `MedicalRecord` contains `Diagnosis` (parent relationship)
- `MedicalRecord` contains `Prescription` (parent relationship)
- `Patient` schedules `Appointment` with `Doctor` (appointment relationship)

```typescript
// Example Resource Relationship
await permit.api.resources.create({
  key: "diagnosis",
  name: "Diagnosis",
  relations: {
    parent: "medicalRecord",
  },
});
```

### Role Derivations

- `MedicalRecord#Owner` → `Diagnosis#Viewer` (Patient can view their diagnoses)
- `MedicalRecord#Editor` → `Diagnosis#Editor` (Doctor can edit diagnoses for assigned patients)
- `Patient treating_physician Doctor` → `MedicalRecord#Editor` (Doctor can edit records of patients they treat)

```typescript
// Example Role Derivation
await permit.api.resources.create({
  key: "diagnosis",
  name: "Diagnosis",
  roles: {
    editor: {
      name: "Editor",
      permissions: ["view", "update"],
      granted_to: {
        users_with_role: [
          {
            role: "editor",
            on_resource: "medicalRecord",
            linked_by_relation: "parent",
          },
        ],
      },
    },
  },
});
```

## 4. Attributes (ABAC)

Attributes enable conditional access based on user and resource properties.

### User Attributes

- `user.department`: Medical department (e.g., "Cardiology", "Pediatrics")
- `user.role`: Professional role (e.g., "Physician", "Nurse", "Researcher")
- `user.clearance`: Data access clearance level (e.g., 1-5)
- `user.specialization`: Medical specialization
- `user.isBlocked`: User access restriction flag

### Resource Attributes

- `medicalRecord.patientId`: ID of the patient the record belongs to
- `medicalRecord.sensitivity`: Sensitivity level of the record (e.g., "Normal", "Sensitive", "Restricted")
- `medicalRecord.department`: Department the record belongs to
- `diagnosis.condition`: Medical condition category
- `appointment.status`: Appointment status

```typescript
// Example Attribute Setup
await permit.api.usersConfig.setUserAttributeConfig({
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
});
```

## 5. Policy Implementation

### RBAC Implementation

Basic role permissions are defined using RBAC rules:

```typescript
// RBAC Policy Example
await permit.api.roles.create({
  key: "patient",
  name: "Patient",
  permissions: [
    "medicalRecord:view",
    "appointment:view",
    "appointment:create",
    "prescription:view",
    "chat:create",
    "chat:view",
  ],
});
```

### ABAC Implementation

Attribute-based conditions for fine-grained access control:

```typescript
// ABAC Policy Example - Condition Set
await permit.api.conditionSets.create({
  key: "high_clearance_records",
  name: "High Clearance Records Access",
  conditions: {
    allOf: [
      {
        user: {
          clearance: {
            gte: 4
          }
        }
      },
      {
        resource: {
          sensitivity: {
            eq: "Restricted"
          }
        }
      }
    ]
  }
});

// Apply condition to permission
await permit.api.conditionSetRules.create({
  condition_set_key: "high_clearance_records",
  permission: {
    action: "view",
    resource: "medicalRecord",
  },
});
```

### ReBAC Implementation

Relationship-based access control using treating physician relationship:

```typescript
// ReBAC Policy Example
await permit.api.resourceRelations.create({
  resource: "medicalRecord",
  relation: "treating_physician",
  subject_resource: "user",
});

// Grant access based on relationship
await permit.api.roleDerivations.create({
  role: "editor",
  resource: "medicalRecord",
  derived_from: {
    subject_relation: {
      resource_type: "user",
      relation: "treating_physician",
    },
  },
});
```

## 6. Enforcement Points

### API Middleware

```typescript
// API Route Middleware
export const permitMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  // Extract user and resource information
  const user = await getSessionUser(req);
  const resourceType = getResourceType(req);
  const resourceId = getResourceId(req);
  
  // Get attributes for context
  const resourceAttributes = await getResourceAttributes(resourceType, resourceId);
  
  // Check permissions using Permit.io
  const allowed = await permit.check({
    user: user.id,
    action: mapMethodToAction(req.method),
    resource: resourceType,
    context: { 
      attributes: resourceAttributes,
      tenant: user.tenant
    }
  });
  
  if (!allowed) {
    return res.status(403).json({ error: "Not authorized" });
  }
  
  return next();
};
```

### RAG Query Filtering

```typescript
// RAG Query Authorization
async function authorizeRagQuery(user, query, resourceType) {
  // Check if user can perform the search action
  const canSearch = await permit.check({
    user: user.id,
    action: "search",
    resource: resourceType
  });
  
  if (!canSearch) {
    throw new Error("Not authorized to search this resource");
  }
  
  // Get user attributes for filtering
  const userAttrs = await permit.getUserAttributes(user.id);
  
  // Create filters based on permissions
  return createPermissionFilters(userAttrs);
}
```

### Response Enforcement

```typescript
// Response Filtering
async function filterAIResponse(user, response, resourceType) {
  // Get user permissions
  const userPermissions = await permit.getUserPermissions(user.id);
  
  // Apply field-level masking based on permissions
  return applyFieldMasking(response, userPermissions);
}
```

## 7. Security Testing Implementation

Test cases to verify proper authorization enforcement:

- TC-001: Patient attempts to access another patient's records (should be denied)
- TC-002: Doctor attempts to access patient not under their care (should be denied)
- TC-003: Researcher attempts to access non-anonymized data (should be denied)
- TC-004: Admin role access to system-wide resources (should be allowed)
- TC-005: Doctor with correct department and clearance accessing restricted records (should be allowed)
- TC-006: Attempt to bypass restrictions through prompt injection (should be detected and blocked)

## 8. Audit and Compliance

Implementation of comprehensive audit logging:

```typescript
// Audit Logging
async function logAccessAttempt(user, action, resource, allowed) {
  await auditLogger.log({
    timestamp: new Date(),
    userId: user.id,
    userRole: user.role,
    action: action,
    resource: resource,
    allowed: allowed,
    context: {
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }
  });
}
```

This implementation follows best practices for healthcare data protection and ensures that all access to sensitive medical information is properly authorized according to RBAC, ABAC, and ReBAC models.
