import { initGroundXClient } from "./client";
import { getOrCreateBucket } from "./services/bucket";
import { logger } from "@repo/logs";

// Load environment variables
interface SetupConfig {
  apiKey: string;
  baseURL?: string;
  bucketName: string;
  bucketDescription?: string;
}

/**
 * Initialize GroundX client and set up default bucket
 * @param config Setup configuration
 * @returns Created/existing bucket ID
 */
export async function setupGroundX(config: SetupConfig): Promise<number> {
  try {
    // Initialize the client
    const client = initGroundXClient({
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.groundx.ai/api/v1",
    });
    
    // Create or get the default bucket
    const bucket = await getOrCreateBucket(
      config.bucketName,
      config.bucketDescription
    );
    
    // Update the client with the default bucket ID
    client.defaultBucketId = bucket.id;
    
    logger.info({
      bucketId: bucket.id,
      bucketName: bucket.name,
    }, "GroundX setup completed successfully");
    
    return bucket.id;
  } catch (error) {
    logger.error({ error }, "GroundX setup failed");
    throw error;
  }
}

/**
 * Main setup script that can be run directly with bun
 */
async function main() {
  // Check if environment variables are available
  const apiKey = process.env.GROUNDX_API_KEY;
  if (!apiKey) {
    console.error("GROUNDX_API_KEY environment variable is required");
    process.exit(1);
  }
  
  const baseURL = process.env.GROUNDX_API_URL;
  const bucketName = process.env.GROUNDX_BUCKET_NAME || "medical-data";
  const bucketDescription = process.env.GROUNDX_BUCKET_DESCRIPTION || 
    "Default bucket for medical RAG data in the Permit.io ABAC demo";
  
  try {
    const bucketId = await setupGroundX({
      apiKey,
      baseURL,
      bucketName,
      bucketDescription,
    });
    
    console.log(`GroundX setup completed. Default bucket ID: ${bucketId}`);
    process.exit(0);
  } catch (error) {
    console.error("GroundX setup failed:", error);
    process.exit(1);
  }
}

// Run the script directly when executed with bun
if (require.main === module) {
  main().catch(console.error);
}

// Export for programmatic usage
export { setupGroundX as default }; 