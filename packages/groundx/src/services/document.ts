import { getGroundXClient } from "../client";
import { Document, DocumentUploadParams, documentUploadSchema } from "../types";
import { logger } from "@repo/logs";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Upload a document to GroundX
 * @param params Document upload parameters
 * @returns Array of uploaded document data
 */
export async function uploadDocument(params: DocumentUploadParams): Promise<Document[]> {
  // Validate input
  documentUploadSchema.parse(params);
  
  try {
    const client = getGroundXClient().getClient();
    const response = await client.post<Document[]>('/ingest/documents/local', [params]);
    
    logger.info({
      fileName: params.metadata.fileName,
      bucketId: params.metadata.bucketId,
    }, "Document uploaded to GroundX");
    
    return response.data;
  } catch (error) {
    logger.error({
      fileName: params.metadata.fileName,
      bucketId: params.metadata.bucketId,
      error,
    }, "Failed to upload document to GroundX");
    throw error;
  }
}

/**
 * Upload a file from disk to GroundX
 * @param filePath Path to the file
 * @param bucketId Target bucket ID
 * @param metadata Additional metadata for search
 * @returns Uploaded document data
 */
export async function uploadFile(
  filePath: string, 
  bucketId: number, 
  metadata?: Record<string, any>
): Promise<Document[]> {
  try {
    // Read file
    const fileData = await fs.readFile(filePath);
    const base64Data = fileData.toString('base64');
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).slice(1);
    
    // Upload document
    return await uploadDocument({
      blob: base64Data,
      metadata: {
        bucketId,
        fileName,
        fileType: fileExt,
        searchData: metadata,
      },
    });
  } catch (error) {
    logger.error({ filePath, bucketId, error }, "Failed to upload file to GroundX");
    throw error;
  }
}

/**
 * Get document status by ID
 * @param documentId Document ID
 * @returns Document data with status
 */
export async function getDocumentStatus(documentId: string): Promise<Document> {
  try {
    const client = getGroundXClient().getClient();
    const response = await client.get<Document>(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    logger.error({ documentId, error }, "Failed to get document status from GroundX");
    throw error;
  }
}

/**
 * List all documents in a bucket
 * @param bucketId Bucket ID
 * @returns Array of documents
 */
export async function listDocuments(bucketId: number): Promise<Document[]> {
  try {
    const client = getGroundXClient().getClient();
    const response = await client.get<Document[]>(`/documents`, {
      params: { bucketId },
    });
    return response.data;
  } catch (error) {
    logger.error({ bucketId, error }, "Failed to list documents from GroundX");
    throw error;
  }
}

/**
 * Delete a document by ID
 * @param documentId Document ID
 * @returns Success status
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const client = getGroundXClient().getClient();
    await client.delete(`/documents/${documentId}`);
    logger.info({ documentId }, "Document deleted from GroundX");
    return true;
  } catch (error) {
    logger.error({ documentId, error }, "Failed to delete document from GroundX");
    throw error;
  }
} 