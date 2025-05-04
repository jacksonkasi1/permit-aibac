# GroundX RAG Integration

A utility package for integrating with EyeLevel GroundX RAG (Retrieval-Augmented Generation) services.

## Features

- Document uploading and management (local and remote)
- Website crawling for content ingestion
- Bucket creation and administration
- High-accuracy semantic search
- TypeScript/Node.js support with full type definitions

## Installation

This package is part of the monorepo and can be used by adding it as a dependency:

```bash
pnpm add @repo/groundx
```

## Configuration

The package requires environment variables:

```
GROUNDX_API_KEY=your_api_key
GROUNDX_API_URL=https://api.groundx.ai/api/v1 # Optional, defaults to this value
GROUNDX_BUCKET_NAME=your_bucket_name # Optional, defaults to "medical-data"
GROUNDX_BUCKET_DESCRIPTION=your_description # Optional
```

## Usage

### Initialize the Client

```typescript
import { initGroundXClient } from '@repo/groundx';

// Initialize the client
initGroundXClient({
  apiKey: process.env.GROUNDX_API_KEY!,
  baseURL: process.env.GROUNDX_API_URL, // Optional
});
```

### Verify API Key and Setup

```typescript
import { verifyApiKey, setupGroundX } from '@repo/groundx';

// Verify the API key is valid
await verifyApiKey(process.env.GROUNDX_API_KEY!);

// Set up default bucket
const bucketId = await setupGroundX({
  apiKey: process.env.GROUNDX_API_KEY!,
  bucketName: 'medical-data',
  bucketDescription: 'Medical data for RAG system'
});
```

### Upload Documents

#### Local Files

```typescript
import { uploadFile, uploadDocument } from '@repo/groundx';

// Upload from file path
const document = await uploadFile(
  '/path/to/medical-document.pdf',
  bucketId,
  { patientId: '12345', isConfidential: true }
);

// Upload raw data
const documentData = await uploadDocument({
  blob: base64EncodedData,
  metadata: {
    bucketId: bucketId,
    fileName: 'patient-record.json',
    fileType: 'json',
    processLevel: 'full', // 'full', 'basic', or 'none'
    searchData: {
      patientId: '12345',
      department: 'cardiology'
    }
  }
});
```

#### Remote Documents

```typescript
import { uploadRemoteDocument } from '@repo/groundx';

// Upload a document from a URL
const remoteDoc = await uploadRemoteDocument(
  'https://example.com/path/to/document.pdf',
  bucketId,
  'remote-document.pdf',
  'pdf',
  { category: 'medical', department: 'oncology' }
);
```

### Crawl Websites

```typescript
import { crawlWebsite, crawl } from '@repo/groundx';

// Simple website crawl
const crawledDocs = await crawl(
  'https://example.com/medical-info',
  bucketId,
  2, // depth
  10 // max pages to crawl
);

// Advanced website crawl
const advancedCrawl = await crawlWebsite({
  bucketId: bucketId,
  sourceUrl: 'https://example.com/medical-info',
  depth: 3,
  cap: 20,
  searchData: {
    category: 'medical-resource',
    department: 'cardiology'
  }
});
```

### Search Documents

```typescript
import { search, searchContent } from '@repo/groundx';

// Simple search
const results = await search('heart disease symptoms', bucketId);

// Advanced search with filters
const advancedResults = await searchContent({
  query: 'heart disease symptoms',
  bucketId: bucketId,
  filter: {
    department: 'cardiology',
    isConfidential: false
  },
  n: 10,
  includeMetadata: true
});
```

### Bucket Management

```typescript
import { 
  createBucket, 
  getBucket, 
  listBuckets,
  deleteBucket,
  getOrCreateBucket
} from '@repo/groundx';

// Create a new bucket
const newBucket = await createBucket({
  name: 'radiology-data',
  description: 'Radiology reports and images'
});

// Get or create a bucket
const bucket = await getOrCreateBucket('oncology-data', 'Oncology reports and research papers');

// List all buckets
const buckets = await listBuckets();
```

### Document Management

```typescript
import { 
  getDocumentStatus, 
  listDocuments, 
  deleteDocument 
} from '@repo/groundx';

// Check document processing status
const status = await getDocumentStatus(documentId);

// List all documents in a bucket
const documents = await listDocuments(bucketId);
```

## Running Setup Script

You can run the setup script to initialize GroundX with a default bucket:

```bash
# Make sure environment variables are set
export GROUNDX_API_KEY=your_api_key

# Run the setup script
bun run setup
```

## Error Handling

All functions include proper error handling and logging via the `@repo/logs` package. The library will throw detailed errors when API calls fail, including:

- Authentication errors (invalid API key)
- Network errors
- API-specific errors
- Data validation errors

## GroundX Features

This integration takes advantage of GroundX's advanced RAG capabilities:

- Proprietary ingestion pipeline for document processing
- Anti-hallucination technology with dynamic chunking
- Context-aware metadata generation
- Semantic object creation for higher retrieval accuracy
- Enterprise-grade security 