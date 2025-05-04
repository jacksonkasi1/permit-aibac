# @repo/permit

A central authorization package for configuring and using Permit.io in the Secure AI Medical System.

## Features

- **Authorization Setup**: Script to initialize all resources, roles, and permissions in Permit.io
- **API Middleware**: Ready-to-use middleware for Hono routes for permission enforcement
- **RAG Filtering**: Utilities for filtering vector search results based on user permissions
- **Response Enforcement**: Functions to mask sensitive data in AI responses

## Getting Started

### Prerequisites

- Permit.io account with an API key
- Policy Decision Point (PDP) - either local or cloud

### Installation

This package is part of the monorepo and should already be installed via pnpm workspaces.

### Environment Setup

1. Copy the example environment file:

```bash
cp packages/permit/example.env packages/permit/.env
```

2. Fill in your Permit.io credentials:

```
PERMIT_API_KEY=your_permit_api_key
PERMIT_PDP_URL=http://localhost:7766  # For local PDP
```

### Running the Setup Script

The setup script initializes all resources, roles, permissions, and policies in Permit.io:

```bash
bun run -C packages/permit setup
```

This will:
- Create all resources (MedicalRecord, Prescription, etc.)
- Define all roles (Admin, Doctor, Patient, etc.)
- Configure resource relationships for ReBAC
- Set up attributes for ABAC
- Apply condition sets to permissions

## Using in Your API

Import the middleware in your Hono API routes:

```typescript
import { permitMiddleware } from "@repo/permit";

// Use in your Hono app
app.use("/api/*", permitMiddleware);
```

## Direct Permission Checks

For manual permission checks, use the permit.check() method:

```typescript
import { permit } from "@repo/permit";

async function canUserAccessResource(userId: string, resourceType: string) {
  // Using the object syntax (recommended)
  const allowed = await permit.check({
    user: userId,
    action: "view",
    resource: resourceType,
    context: {
      attributes: { sensitivity: "Normal" },
      tenant: "default"
    }
  });
  
  return allowed;
}
```

## Usage in RAG Pipelines

Filter RAG queries based on user permissions:

```typescript
import { authorizeRagQuery } from "@repo/permit";

async function performSecureSearch(userId: string, query: string) {
  const { allowed, filters } = await authorizeRagQuery(userId, query, "medicalRecord");
  
  if (!allowed) {
    throw new Error("Unauthorized search");
  }
  
  // Use the filters in your vector search
  return vectorDb.search(query, filters);
}
```

## Response Filtering

Mask sensitive data in AI responses:

```typescript
import { filterAIResponse } from "@repo/permit";

async function getSecureAIResponse(userId: string, llmResponse: string) {
  // Apply permissions-based masking to the response
  return filterAIResponse(userId, llmResponse, "aiResponse");
}
```

## Working with Resource Relations

To create and manage resource relations:

```typescript
import { permit } from "@repo/permit";

// Example: Create doctor-patient relationship
await permit.api.resourceRelations.create({
  resource: "user", // Patient resource
  relation: "treating_physician", 
  subject_resource: "user" // Doctor resource
});

// Example: Assign a doctor to a patient
await permit.api.relationshipTuples.create({
  subject: { type: "user", id: "doctor-123" },
  relation: "treating_physician",
  object: { type: "user", id: "patient-456" }
});
```

## Running a Local PDP

For development, you can run a local PDP Docker container:

```bash
docker pull permitio/pdp-v2:latest
docker run -it \
  -p 7766:7000 \
  --env PDP_API_KEY=<YOUR_API_KEY> \
  --env PDP_DEBUG=True \
  permitio/pdp-v2:latest
```

## Documentation

For details on the authorization model, refer to:
- [PERMIT.md](../../PERMIT.md) - Detailed authorization implementation
- [PERMIT-TABLE.md](../../PERMIT-TABLE.md) - Summary of resources, roles, and permissions 