import { z } from "zod";

// Environment variables
export interface GroundXEnv {
  apiKey: string;
  baseURL: string;
  defaultBucketId?: number;
}

// Bucket types
export interface Bucket {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBucketParams {
  name: string;
  description?: string;
}

// Document types
export interface Document {
  id: string;
  bucketId: number;
  fileName: string;
  fileType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface DocumentUploadParams {
  blob: string; // base64 encoded content
  metadata: {
    bucketId: number;
    fileName: string;
    fileType: string;
    searchData?: Record<string, any>;
  };
}

// Search types
export interface SearchParams {
  query: string;
  bucketId?: number;
  filter?: Record<string, any>;
  n?: number;
  includeMetadata?: boolean;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: string;
}

// Validation schemas
export const documentUploadSchema = z.object({
  blob: z.string(),
  metadata: z.object({
    bucketId: z.number(),
    fileName: z.string(),
    fileType: z.string(),
    searchData: z.record(z.any()).optional(),
  }),
});

export const searchParamsSchema = z.object({
  query: z.string(),
  bucketId: z.number().optional(),
  filter: z.record(z.any()).optional(),
  n: z.number().optional(),
  includeMetadata: z.boolean().optional(),
}); 