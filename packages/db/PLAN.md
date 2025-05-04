# Permit.io + LangChain.js + Langflow PoC Project Plan

## 1. Project Overview

This Proof of Concept (PoC) demonstrates a secure AI system for medical data access with fine-grained authorization using Permit.io, LangChain.js, and Langflow. The system enforces attribute-based access control (ABAC) to protect sensitive medical information while providing personalized AI interactions based on user roles (Doctor or Patient).

## 2. System Architecture

```
┌──────────────┐       ┌───────────────────┐        ┌─────────────────┐
│              │       │                   │        │                 │
│   Frontend   ├──────►│   API Gateway     ├───────►│  Langflow       │
│   (Next.js)  │       │   (Next.js API)   │        │  Orchestration  │
└──────────────┘       └───────────────────┘        └─────────┬───────┘
                                                              │
                                                              ▼
┌───────────────┐      ┌───────────────────┐        ┌─────────────────┐
│               │      │                   │        │                 │
│  Permit.io    │◄─────┤   LangChain.js    │◄───────┤  LLM Service    │
│  Controls     │      │   Agents/RAG      │        │  (OpenAI/etc)   │
└───────┬───────┘      └─────────┬─────────┘        └─────────────────┘
        │                        │
        │                        │                  ┌─────────────────┐
        │                        │                  │                 │
        │                        └─────────────────►│  Upstash QStash │
        │                                           │  (Workflows)    │
        ▼                        ▼                  └─────────────────┘
┌───────────────┐      ┌───────────────────┐
│               │      │                   │
│  Policy Store │      │  Vector Database  │
│  (OPA/Cloud)  │      │  (GroundX RAG)    │
└───────────────┘      └───────────────────┘
```

## 3. Core Components

### 3.1. Frontend Layer
- Next.js web interface for user authentication and interaction
- Role-specific UI components for doctors and patients
- React components for medical data visualization
- Vercel deployment for frontend and API routes

### 3.2. API Gateway
- Next.js API routes handling authentication and request routing
- Integration with Permit.io for initial authorization checks
- Request validation and sanitization
- Serverless functions via Vercel

### 3.3. Langflow Orchestration
- Visual workflow builder for AI agent configuration
- Custom nodes for Permit.io integration
- Flow management for different medical use cases
- External hosting or cloud deployment

### 3.4. LangChain.js Components
- RAG pipeline for medical data retrieval
- Custom agents with role-based tool access
- LangSmith integration for tracing and debugging

### 3.5. Permit.io Authorization Layer
- ABAC policy enforcement for all system interactions
- Real-time permission checks
- Attribute-based filtering for medical data

### 3.6. Vector Database (EyeLevel GroundX)
- Proprietary RAG ingestion pipeline for medical documents
- Anti-hallucination technology with dynamic chunking
- Context-aware metadata generation
- Semantic object creation for higher retrieval accuracy
- Enterprise-grade security with encryption at rest and in transit

### 3.7. Upstash QStash
- Asynchronous workflow processing
- Background job management for long-running tasks
- Secure scheduling for notification and data processing workflows

## 4. Security Controls Implementation

### 4.1. Prompt Filtering
- Pre-processing layer using Permit.io to validate prompt intent
- Prompt classification to determine required permissions
- Policy-based filtering to block unauthorized queries

### 4.2. Secure Raw Data Retrieval
- Attribute-based filtering before vector search execution
- Field-level masking for sensitive information (insurance IDs, full diagnoses)
- Role-specific data views enforced at retrieval time
- GroundX's proprietary search engine for improved accuracy over standard vector similarity
- Result re-ranking based on question relevance

### 4.3. External Access Enforcement
- Tool usage permission checks before execution
- Resource-level permissions for appointment scheduling
- Audit logging of all external actions

### 4.4. Response Enforcement
- Post-processing of AI responses to remove unauthorized information
- Content filtering for inappropriate or toxic content
- Final permission check before delivering response to user
- Reduction of hallucinations through GroundX's semantic object processing

## 5. Implementation Phases

### Phase 1: Environment Setup and Core Components
- [ ] Set up Next.js development environment
- [ ] Configure Langflow instance
- [ ] Create EyeLevel GroundX account and obtain API key
- [ ] Initialize GroundX buckets for medical data storage
- [ ] Set up Upstash QStash for workflows
- [ ] Create Permit.io account and initial policies
- [ ] Establish basic Next.js API routes structure
- [ ] Set up authentication system (Auth0/NextAuth.js)
- [ ] Configure Vercel project for deployment

### Phase 2: Authorization Framework
- [ ] Implement Permit.io SDK integration
- [ ] Define ABAC policy model for medical data
- [ ] Create role definitions for Doctor and Patient
- [ ] Design attribute schema for medical records
- [ ] Implement basic authorization checks
- [ ] Test permission enforcement
- [ ] Deploy authorization layer to Vercel

### Phase 3: GroundX RAG and LangChain.js Implementation
- [ ] Upload medical documents to GroundX via API
- [ ] Build document ingest pipeline for medical data
- [ ] Implement GroundX-powered search with LangChain.js
- [ ] Integrate Permit.io checks with RAG workflow
- [ ] Set up LangSmith for tracing
- [ ] Create secure retrieval patterns
- [ ] Configure Vercel serverless functions for RAG

### Phase 4: Langflow Orchestration
- [ ] Design custom Langflow components for Permit.io
- [ ] Create flow templates for different medical scenarios
- [ ] Implement security-focused flow patterns
- [ ] Connect Langflow to backend services
- [ ] Test end-to-end workflows
- [ ] Configure Vercel Edge functions for optimal performance

### Phase 5: Security Hardening and Testing
- [ ] Implement comprehensive security testing suite
- [ ] Conduct red team exercises
- [ ] Test prompt injection defenses
- [ ] Verify data isolation between roles
- [ ] Validate all security controls
- [ ] Document security architecture
- [ ] Finalize production deployment on Vercel

## 6. Detailed Technical Tasks

### 6.1. Permit.io Integration
```typescript
// Example: Next.js API middleware for Permit.io integration
import { NextApiRequest, NextApiResponse } from 'next';
import { Permit } from 'permitio';

const permit = new Permit({
  pdp: 'https://cloudpdp.permit.io',
  token: process.env.PERMIT_API_KEY
});

export const permitMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  // Extract user and resource information
  const user = await getSessionUser(req);
  const resource = getRequestedResource(req);
  
  // Check permissions using Permit.io
  const allowed = await permit.check({
    user: user.id,
    action: req.method || 'READ',
    resource: resource.type,
    context: { attributes: resource.attributes }
  });
  
  if (!allowed) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  return next();
};
```

### 6.2. EyeLevel GroundX RAG Implementation
```typescript
// Example: Secure RAG implementation with GroundX and LangChain.js
import axios from 'axios';
import { ChatOpenAI } from "@langchain/openai";
import { Permit } from 'permitio';

const permit = new Permit({
  pdp: 'https://cloudpdp.permit.io',
  token: process.env.PERMIT_API_KEY
});

// Initialize GroundX API client
const groundxAPI = axios.create({
  baseURL: 'https://api.groundx.ai/api/v1',
  headers: {
    'X-API-Key': process.env.GROUNDX_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Upload a document to GroundX
 */
async function uploadMedicalDocument(filePath: string, fileName: string, bucketId: number) {
  const fileData = await fs.readFile(filePath);
  const base64Data = fileData.toString('base64');
  
  const response = await groundxAPI.post('/ingest/documents/local', [{
    blob: base64Data,
    metadata: {
      bucketId: bucketId,
      fileName: fileName,
      fileType: getFileType(fileName),
      // You can add custom metadata attributes to filter on later
      searchData: {
        isConfidential: true,
        department: 'cardiology',
        lastUpdated: new Date().toISOString()
      }
    }
  }]);
  
  return response.data;
}

/**
 * Perform secure retrieval based on user permissions
 */
async function secureRetrieval(user: User, query: string) {
  // Get user permissions
  const userAttrs = await permit.getUserAttributes(user.id);
  
  // Create filters based on permissions
  const permissionFilters = createPermissionFilters(userAttrs);
  
  // Search for relevant content with GroundX
  const searchResponse = await groundxAPI.post('/search/content', {
    query: query,
    filter: permissionFilters,
    n: 5, // Number of results to return
    includeMetadata: true
  });
  
  const { results } = searchResponse.data;
  
  // Filter out any sensitive information based on user role
  const filteredContexts = results.map(result => {
    if (user.role !== 'doctor' && result.metadata?.isConfidential) {
      return sanitizeConfidentialContent(result.content);
    }
    return result.content;
  });
  
  // Create the context for the LLM
  const context = filteredContexts.join('\n\n');
  
  // Generate response using OpenAI
  const model = new ChatOpenAI({ 
    temperature: 0, 
    modelName: "gpt-4-turbo"
  });
  
  const response = await model.invoke([
    ["system", `You are a medical assistant. Use ONLY the following context to answer the question: ${context}`],
    ["user", query]
  ]);
  
  // Apply post-response filtering
  const filteredResponse = await postProcessResponse(response.content, userAttrs);
  
  return filteredResponse;
}
```

### 6.3. Upstash QStash Workflow
```typescript
// Example: Next.js API workflow endpoint with Upstash QStash
import { serve } from "@upstash/workflow/nextjs";
import { Permit } from 'permitio';
import axios from 'axios';

const permit = new Permit({
  pdp: 'https://cloudpdp.permit.io',
  token: process.env.PERMIT_API_KEY
});

// GroundX API client
const groundxAPI = axios.create({
  baseURL: 'https://api.groundx.ai/api/v1',
  headers: {
    'X-API-Key': process.env.GROUNDX_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Define workflow for processing patient history updates
export const { POST } = serve(async (context) => {
  // Authorization check from headers
  const authHeader = context.headers.get("authorization");
  const bearerToken = authHeader?.split(" ")[1];
  
  if (!isValidToken(bearerToken)) {
    console.error("Authentication failed.");
    return;
  }
  
  const { patientId, doctorId, recordData } = context.requestPayload;
  
  // Check if doctor has permission to update patient records
  const permissionCheck = await context.run("check_permission", async () => {
    const allowed = await permit.check({
      user: doctorId,
      action: "update",
      resource: "patient_record",
      context: { patientId }
    });
    return allowed;
  });
  
  if (!permissionCheck) {
    return { status: "error", message: "Permission denied" };
  }
  
  // Process the update in steps
  const sanitizedData = await context.run("sanitize_data", async () => {
    // Sanitize and validate incoming data
    return sanitizePatientData(recordData);
  });
  
  // Upload document to GroundX
  const documentUpload = await context.run("upload_to_groundx", async () => {
    // Convert the data to a suitable format
    const base64Data = Buffer.from(
      JSON.stringify(sanitizedData)
    ).toString('base64');
    
    // Upload to GroundX
    const response = await groundxAPI.post('/ingest/documents/local', [{
      blob: base64Data,
      metadata: {
        bucketId: process.env.GROUNDX_BUCKET_ID,
        fileName: `patient_${patientId}_update_${Date.now()}.json`,
        fileType: 'json',
        searchData: {
          patientId,
          doctorId,
          updatedAt: new Date().toISOString()
        }
      }
    }]);
    
    return response.data;
  });
  
  await context.run("send_notification", async () => {
    // Notify relevant parties about the update
    await sendNotification(patientId, "Your medical record has been updated");
  });
  
  return { 
    status: "success",
    documentId: documentUpload[0].id 
  };
});
```

### 6.4. Vercel Deployment Configuration
```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/api/workflow/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    },
    "src/api/chat/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": {
    "GOOGLE_GENERATIVE_AI_API_KEY": "@GOOGLE_GENERATIVE_AI_API_KEY",
    "PERMIT_API_KEY": "@permit_api_key",
    "GROUNDX_API_KEY": "@groundx_api_key",
    "GROUNDX_BUCKET_ID": "@groundx_bucket_id",
    "QSTASH_URL": "@qstash_url",
    "QSTASH_TOKEN": "@qstash_token"
  }
}
```

### 6.5. Langflow Custom Component
```typescript
// Example of how you'd build a Langflow component connector in TypeScript
// This would connect to the Python-based Langflow server
import axios from 'axios';
import { Permit } from 'permitio';

class PermitSecurityFilter {
  private permitClient: any;
  private langflowApiKey: string;
  private langflowUrl: string;

  constructor(config: {
    permitApiKey: string, 
    langflowApiKey: string,
    langflowUrl: string
  }) {
    this.permitClient = new Permit({
      pdp: 'https://cloudpdp.permit.io',
      token: config.permitApiKey
    });
    this.langflowApiKey = config.langflowApiKey;
    this.langflowUrl = config.langflowUrl;
  }

  async registerComponent() {
    // Register custom component with Langflow
    const componentDef = {
      name: "PermitSecurityFilter",
      displayName: "Permit.io Security Filter",
      description: "Filters prompts and responses based on Permit.io policies",
      // Component definition details would go here
    };

    await axios.post(
      `${this.langflowUrl}/api/v1/custom-components`,
      componentDef,
      {
        headers: {
          Authorization: `Bearer ${this.langflowApiKey}`
        }
      }
    );
  }

  async checkPromptPermission(userId: string, action: string, resource: string, prompt: string, data: any) {
    // Check if prompt is allowed using Permit.io
    const allowed = await this.permitClient.check({
      user: userId,
      action: action,
      resource: resource,
      context: { prompt, ...data }
    });

    if (!allowed) {
      return { 
        status: "rejected", 
        reason: "Unauthorized prompt" 
      };
    }

    return { 
      status: "approved", 
      filteredPrompt: prompt 
    };
  }
}
```

## 7. Testing Strategy

### 7.1. Security Testing
- Prompt injection attacks to bypass filters
- Role impersonation attempts
- Attempts to access prohibited data through prompt engineering
- Testing of data leakage in responses
- Verification of attribute-based filtering
- Hallucination detection and mitigation efficacy tests

### 7.2. Functional Testing
- Role-specific user journeys
- End-to-end workflow verification using Jest and Cypress
- Error handling and edge cases
- Performance under various load conditions
- Serverless function limits and edge cases in Vercel environment
- GroundX RAG accuracy and recall comparison tests

### 7.3. Test Cases

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-001 | Patient attempts to access another patient's records | Access denied |
| TC-002 | Patient requests own medical history | Limited access granted |
| TC-003 | Doctor attempts to access patient records | Access granted with full details |
| TC-004 | Patient attempts prompt injection | Injection detected and blocked |
| TC-005 | Doctor books appointment for patient | Operation allowed |
| TC-006 | Patient attempts to book premium appointment | Operation denied |
| TC-007 | Response contains unauthorized information | Information filtered before delivery |
| TC-008 | Vercel function timeout handling | Graceful failure with user notification |
| TC-009 | Medical document with complex tables and charts | Accurate parsing and retrieval by GroundX |
| TC-010 | Ambiguous medical query that could cause hallucination | Factual, source-backed response from GroundX RAG |

## 8. Next Steps After PoC

- Production scale Vercel deployment
- Enhanced monitoring and alerting
- Expanded policy model for complex medical scenarios
- Integration with medical information systems
- User feedback collection and iteration
- Additional GroundX buckets for specialized medical domains
