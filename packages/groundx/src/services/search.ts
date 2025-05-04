import { getGroundXClient } from "../client";
import { SearchParams, SearchResponse, searchParamsSchema } from "../types";
import { logger } from "@repo/logs";

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
  
  try {
    const client = getGroundXClient().getClient();
    const response = await client.post<SearchResponse>('/search/content', params);
    
    logger.info({
      query: params.query,
      bucketId: params.bucketId,
      resultCount: response.data.results.length,
    }, "GroundX search completed");
    
    return response.data;
  } catch (error) {
    logger.error({
      query: params.query,
      bucketId: params.bucketId,
      error,
    }, "GroundX search failed");
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
  filter?: Record<string, any>
): Promise<SearchResponse> {
  return searchContent({
    query,
    bucketId,
    filter,
    includeMetadata: true,
    n: 5, // Default to 5 results
  });
} 