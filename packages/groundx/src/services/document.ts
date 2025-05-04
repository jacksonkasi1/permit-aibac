import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@repo/logs";
import { getGroundXClient } from "../client";
import { Document, DocumentType, DocumentUploadParams, documentUploadSchema } from "../types";

// Helper to convert file extension to DocumentType
function getDocumentType(fileExt: string): DocumentType | undefined {
  const ext = fileExt.toLowerCase();
  const validTypes: DocumentType[] = [
    "bmp", "csv", "docx", "gif", "heif", "hwp", "ico", "jpg", 
    "json", "pdf", "png", "pptx", "svg", "tiff", "tsv", "txt", "xlsx", "webp"
  ];
  
  return validTypes.includes(ext as DocumentType) ? ext as DocumentType : undefined;
}

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

    logger.info("Sending local document upload request to GroundX API");

    // Convert our params to the format expected by the SDK
    // Ensure fileType is valid DocumentType or undefined
    const fileTypeValue = getDocumentType(params.metadata.fileType as string);
    
    const uploadParams = [
      {
        blob: params.blob,
        metadata: {
          bucketId: params.metadata.bucketId,
          fileName: params.metadata.fileName,
          fileType: fileTypeValue,
          processLevel: params.metadata.processLevel,
          searchData: params.metadata.searchData,
        },
      },
    ];

    const response = await client.documents.ingestLocal(uploadParams);

    logger.info(
      {
        fileName: params.metadata.fileName,
        bucketId: params.metadata.bucketId,
      },
      "Document uploaded to GroundX",
    );

    return response as unknown as Document[];
  } catch (error) {
    logger.error(
      {
        fileName: params.metadata.fileName,
        bucketId: params.metadata.bucketId,
        error,
      },
      "Failed to upload document to GroundX",
    );
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
  metadata?: Record<string, any>,
): Promise<Document[]> {
  try {
    logger.info({ filePath, bucketId }, "Reading file for upload to GroundX");

    // Read file
    const fileData = await fs.readFile(filePath);
    const base64Data = fileData.toString("base64");
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).slice(1).toLowerCase();

    logger.info({ fileName, fileSize: fileData.length }, "File read successfully");

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
 * Upload a remote document via URL to GroundX
 * @param sourceUrl URL of the document
 * @param bucketId Target bucket ID
 * @param fileName Optional file name (defaults to URL basename)
 * @param fileType Optional file type
 * @param metadata Additional metadata for search
 * @returns Uploaded document data
 */
export async function uploadRemoteDocument(
  sourceUrl: string,
  bucketId: number,
  fileName?: string,
  fileType?: string,
  metadata?: Record<string, any>,
): Promise<Document[]> {
  try {
    // Use local variables instead of reassigning function parameters
    let documentFileName = fileName;
    let documentFileType = fileType;
    
    if (!documentFileName) {
      // Extract filename from URL if not provided
      const urlObj = new URL(sourceUrl);
      documentFileName = path.basename(urlObj.pathname) || "remote-document";
    }

    if (!documentFileType && documentFileName.includes(".")) {
      const extension = documentFileName.split(".").pop()?.toLowerCase();
      documentFileType = extension || undefined;
    }
    
    // Convert to proper DocumentType
    const validFileType = documentFileType ? getDocumentType(documentFileType) : undefined;

    logger.info({ sourceUrl, bucketId, fileName: documentFileName }, "Uploading remote document to GroundX");

    const client = getGroundXClient().getClient();

    // Create the remote document ingest request
    const ingestRequest = {
      documents: [
        {
          bucketId,
          sourceUrl,
          fileName: documentFileName,
          fileType: validFileType,
          searchData: metadata,
        },
      ],
    };

    const response = await client.documents.ingestRemote(ingestRequest);

    logger.info(
      {
        sourceUrl,
        bucketId,
      },
      "Remote document uploaded to GroundX",
    );

    return response as unknown as Document[];
  } catch (error) {
    logger.error({ sourceUrl, bucketId, error }, "Failed to upload remote document to GroundX");
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
    const response = await client.documents.get(documentId);
    return response as unknown as Document;
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
    const response = await client.documents.lookup(bucketId);
    return (response.documents || []) as unknown as Document[];
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
    await client.documents.deleteById(documentId);
    logger.info({ documentId }, "Document deleted from GroundX");
    return true;
  } catch (error) {
    logger.error({ documentId, error }, "Failed to delete document from GroundX");
    throw error;
  }
}
