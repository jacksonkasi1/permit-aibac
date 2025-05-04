import { logger } from "@repo/logs";
import { getGroundXClient } from "../client";
import { Bucket, CreateBucketParams } from "../types";

/**
 * Create a new bucket
 * @param params Bucket creation parameters
 * @returns Created bucket data
 */
export async function createBucket(params: CreateBucketParams): Promise<Bucket> {
  try {
    const client = getGroundXClient().getClient();
    const response = await client.buckets.create({
      name: params.name,
      // Note: description is not supported in the official API
    });

    logger.info({ bucketName: params.name }, "GroundX bucket created");
    return response as unknown as Bucket;
  } catch (error) {
    logger.error({ bucketName: params.name, error }, "Failed to create GroundX bucket");
    throw error;
  }
}

/**
 * Get bucket by ID
 * @param bucketId Bucket ID
 * @returns Bucket data
 */
export async function getBucket(bucketId: number): Promise<Bucket> {
  try {
    const client = getGroundXClient().getClient();
    const response = await client.buckets.get(bucketId);
    return response as unknown as Bucket;
  } catch (error) {
    logger.error({ bucketId, error }, "Failed to get GroundX bucket");
    throw error;
  }
}

/**
 * List all buckets
 * @returns Array of bucket data
 */
export async function listBuckets(): Promise<Bucket[]> {
  try {
    const client = getGroundXClient().getClient();
    const response = await client.buckets.list();

    logger.info(
      {
        bucketCount: response.buckets?.length || 0,
      },
      "GroundX buckets retrieved",
    );

    return (response.buckets || []) as unknown as Bucket[];
  } catch (error) {
    logger.error({ error }, "Failed to list GroundX buckets");
    throw error;
  }
}

/**
 * Delete a bucket by ID
 * @param bucketId Bucket ID
 * @returns Success status
 */
export async function deleteBucket(bucketId: number): Promise<boolean> {
  try {
    const client = getGroundXClient().getClient();
    await client.buckets.delete(bucketId);
    logger.info({ bucketId }, "GroundX bucket deleted");
    return true;
  } catch (error) {
    logger.error({ bucketId, error }, "Failed to delete GroundX bucket");
    throw error;
  }
}

/**
 * Get or create a bucket by name
 * @param name Bucket name
 * @param description Optional bucket description
 * @returns Bucket data
 */
export async function getOrCreateBucket(name: string, description?: string): Promise<Bucket> {
  try {
    // List all buckets
    const buckets = await listBuckets();

    // Find bucket by name
    const existingBucket = buckets.find((bucket) => bucket.name === name);
    if (existingBucket) {
      logger.info(
        { bucketId: existingBucket.id, bucketName: name },
        "Found existing GroundX bucket",
      );
      return existingBucket;
    }

    // Create a new bucket if not found
    logger.info({ bucketName: name }, "Creating new GroundX bucket");
    return await createBucket({ name, description });
  } catch (error) {
    logger.error({ bucketName: name, error }, "Failed to get or create GroundX bucket");
    throw error;
  }
}
