import { GroundX } from "groundx";
import { z } from "zod";

// Environment variables
export interface GroundXEnv {
  apiKey: string;
  baseURL?: string;
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

// Document types - use compatible structure with groundx package
export interface Document {
  id: string;
  bucketId: number;
  fileName: string;
  fileType: string;
  status: "pending" | "processing" | "completed" | "failed";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

// DocumentType enum from the GroundX SDK
export type DocumentType = "bmp" | "csv" | "docx" | "gif" | "heif" | "hwp" | "ico" | "jpg" | "json" | "pdf" | "png" | "pptx" | "svg" | "tiff" | "tsv" | "txt" | "xlsx" | "webp";

// ProcessLevel enum from the GroundX SDK
export type ProcessLevel = "none" | "full";

// Local document upload parameters
export interface DocumentUploadParams {
  blob: string; // base64 encoded content
  metadata: {
    bucketId: number;
    fileName: string;
    fileType: DocumentType | string;
    filter?: Record<string, any>;
    processLevel?: ProcessLevel;
    searchData?: Record<string, any>;
  };
}

// Remote document upload parameters
export interface RemoteDocumentParams {
  bucketId: number;
  sourceUrl: string;
  fileName?: string;
  fileType?: DocumentType | string;
  filter?: Record<string, any>;
  processLevel?: ProcessLevel;
  searchData?: Record<string, any>;
}

// Website crawl parameters
export interface WebsiteCrawlParams {
  bucketId: number;
  sourceUrl: string;
  cap?: number; // Maximum number of pages to crawl
  depth?: number; // How deep to crawl
  searchData?: Record<string, any>;
}

// Search types
export interface SearchParams {
  query: string;
  bucketId?: number;
  filter?: Record<string, any>;
  n?: number; // Number of results to return
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
    filter: z.record(z.any()).optional(),
    processLevel: z.enum(["full", "none"]).optional(),
    searchData: z.record(z.any()).optional(),
  }),
});

export const remoteDocumentSchema = z.object({
  bucketId: z.number(),
  sourceUrl: z.string().url(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  filter: z.record(z.any()).optional(),
  processLevel: z.enum(["full", "none"]).optional(),
  searchData: z.record(z.any()).optional(),
});

export const websiteCrawlSchema = z.object({
  bucketId: z.number(),
  sourceUrl: z.string().url(),
  cap: z.number().optional(),
  depth: z.number().optional(),
  searchData: z.record(z.any()).optional(),
});

export const searchParamsSchema = z.object({
  query: z.string(),
  bucketId: z.number().optional(),
  filter: z.record(z.any()).optional(),
  n: z.number().optional(),
  includeMetadata: z.boolean().optional(),
});
