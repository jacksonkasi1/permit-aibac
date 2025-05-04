import { logger } from "@repo/logs";
import { getGroundXClient } from "../client";
import { SearchParams, SearchResponse, searchParamsSchema } from "../types";

/**
 * Perform a semantic search using GroundX RAG
 * @param params Search parameters
 * @returns Search results
 */
export async function searchContent(params: SearchParams): Promise<SearchResponse> {
  // Validate input
  searchParamsSchema.parse(params);

  // Use default bucket if not specified
  if (!params.bucketId) {
    const client = getGroundXClient();
    if (client.defaultBucketId) {
      params.bucketId = client.defaultBucketId;
    }
  }

  if (!params.bucketId) {
    throw new Error("BucketId is required for search");
  }

  try {
    logger.info(
      {
        query: params.query,
        bucketId: params.bucketId,
        filter: params.filter,
        resultLimit: params.n,
      },
      "Executing GroundX search",
    );

    const client = getGroundXClient().getClient();

    // Create the search request with the correct structure for content search
    const searchRequest = {
      query: params.query,
      n: params.n,
      verbosity: params.includeMetadata ? 2 : 1,
    };

    // First parameter is the bucketId, second is the search request
    const response = await client.search.content(params.bucketId, searchRequest);

    // Convert response to our internal format
    const results = {
      results: (response.search?.results || []).map(item => ({
        id: item.chunkId || "",
        content: item.text || "",
        score: item.score || 0,
        documentId: item.documentId || "",
        metadata: item.searchData || {},
      })),
      query: params.query,
      timestamp: new Date().toISOString(),
    };

    logger.info(
      {
        query: params.query,
        bucketId: params.bucketId,
        resultCount: results.results.length,
      },
      "GroundX search completed",
    );

    return results;
  } catch (error) {
    logger.error(
      {
        query: params.query,
        bucketId: params.bucketId,
        error,
      },
      "GroundX search failed",
    );
    throw error;
  }
}

/**
 * Search for documents (metadata-based) using GroundX
 * @param params Search parameters
 * @returns Search results
 */
export async function searchDocuments(params: SearchParams): Promise<SearchResponse> {
  // Validate input
  searchParamsSchema.parse(params);

  // Use default bucket if not specified
  if (!params.bucketId) {
    const client = getGroundXClient();
    if (client.defaultBucketId) {
      params.bucketId = client.defaultBucketId;
    }
  }

  try {
    logger.info(
      {
        query: params.query,
        bucketId: params.bucketId,
        filter: params.filter,
        resultLimit: params.n,
      },
      "Executing GroundX document search",
    );

    const client = getGroundXClient().getClient();

    // For document search we need document IDs, but we only have bucket ID
    // First get documents for bucket
    let documentIds: string[] = [];
    if (params.bucketId) {
      const bucketDocuments = await client.documents.lookup(params.bucketId);
      // Map using appropriate property for document IDs
      documentIds = (bucketDocuments.documents || []).map((doc) => {
        // Access the documentId property
        return doc.documentId || "";
      });
    }

    if (documentIds.length === 0) {
      logger.warn("No documents found for search");
      return {
        results: [],
        query: params.query,
        timestamp: new Date().toISOString(),
      };
    }

    // Create the search request with the correct structure for document search
    const searchRequest = {
      query: params.query,
      n: params.n,
      documentIds: documentIds,
      verbosity: params.includeMetadata ? 2 : 1,
    };

    const response = await client.search.documents(searchRequest);

    // Convert response to our internal format
    const results = {
      results: (response.search?.results || []).map(item => ({
        id: item.chunkId || "",
        content: item.text || "",
        score: item.score || 0,
        documentId: item.documentId || "",
        metadata: item.searchData || {},
      })),
      query: params.query,
      timestamp: new Date().toISOString(),
    };

    logger.info(
      {
        query: params.query,
        bucketId: params.bucketId,
        resultCount: results.results.length,
      },
      "GroundX document search completed",
    );

    return results;
  } catch (error) {
    logger.error(
      {
        query: params.query,
        bucketId: params.bucketId,
        error,
      },
      "GroundX document search failed",
    );
    throw error;
  }
}

/**
 * Simple search function that takes a query string and optional bucket ID
 * @param query Search query
 * @param bucketId Optional bucket ID
 * @param filter Optional filter
 * @returns Search results
 */
export async function search(
  query: string,
  bucketId?: number,
  filter?: Record<string, any>,
): Promise<SearchResponse> {
  return searchContent({
    query,
    bucketId,
    filter,
    includeMetadata: true,
    n: 5, // Default to 5 results
  });
}
