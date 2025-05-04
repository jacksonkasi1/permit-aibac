import { logger } from "@repo/logs";
import { initGroundXClient } from "./client";
import { getOrCreateBucket } from "./services/bucket";

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
    logger.info("Initializing GroundX client...");

    console.log("config.apiKey", config.apiKey);
    console.log("config.baseURL", config.baseURL);
    console.log("config.bucketName", config.bucketName);
    console.log("config.bucketDescription", config.bucketDescription);

    // Initialize the client
    const client = initGroundXClient({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });

    console.log("client", client);

    logger.info("GroundX client initialized, setting up bucket...");

    // Create or get the default bucket
    const bucket = await getOrCreateBucket(config.bucketName, config.bucketDescription);

    // Update the client with the default bucket ID
    client.defaultBucketId = bucket.id;

    logger.info(
      {
        bucketId: bucket.id,
        bucketName: bucket.name,
      },
      "GroundX setup completed successfully",
    );

    return bucket.id;
  } catch (error: any) {
    // Enhanced error logging with specific error messages based on error type
    console.log("error:::::", error);
    if (error.statusCode) {
      logger.error(
        {
          status: error.statusCode,
          body: error.body,
        },
        "GroundX API error during setup",
      );

      // Handle specific error codes
      if (error.statusCode === 401 || error.statusCode === 403) {
        logger.error("Authentication error: Invalid API key or insufficient permissions");
      } else if (error.statusCode === 406) {
        logger.error("Not Acceptable error: Check API endpoints and headers");
      }
    } else {
      logger.error(
        {
          message: error.message,
          stack: error.stack,
        },
        "GroundX setup error",
      );
    }

    throw error;
  }
}

/**
 * Verify API key is valid by making a simple request
 * @param apiKey GroundX API key
 * @param baseURL Optional base URL
 * @returns True if valid, throws error if not
 */
export async function verifyApiKey(apiKey: string, baseURL?: string): Promise<boolean> {
  try {
    const client = initGroundXClient({
      apiKey,
      baseURL,
    });

    // Get the client and make a request to verify connectivity
    const groundXClient = client.getClient();
    
    // Use list method instead of check which doesn't exist
    await groundXClient.health.list();

    logger.info("GroundX API key verified successfully");
    return true;
  } catch (error: any) {
    logger.error(
      {
        error: error.message,
        statusCode: error.statusCode,
      },
      "GroundX API key verification failed",
    );
    throw new Error(`Invalid API key or connection error: ${error.message}`);
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
  const bucketName = process.env.GROUNDX_BUCKET_NAME || "permit-aibac";
  const bucketDescription =
    process.env.GROUNDX_BUCKET_DESCRIPTION ||
    "Default bucket for medical RAG data in the Permit.io ABAC demo";

  try {
    console.log("Verifying API key...");
    await verifyApiKey(apiKey, baseURL);

    console.log("Setting up GroundX...");
    const bucketId = await setupGroundX({
      apiKey,
      baseURL,
      bucketName,
      bucketDescription,
    });

    console.log(`GroundX setup completed. Default bucket ID: ${bucketId}`);
    process.exit(0);
  } catch (error: any) {
    console.error("GroundX setup failed:", error.message);

    // Handle specific error patterns
    if (error.statusCode === 406) {
      console.error("The GroundX API returned a 406 Not Acceptable error. This often indicates:");
      console.error("1. The API endpoints may have changed");
      console.error("2. The Accept/Content-Type headers don't match what the API expects");
      console.error("3. The API version may be different than expected");
      console.error("\nPlease check the API documentation for the correct endpoints.");
    }

    process.exit(1);
  }
}

// Run the script directly when executed with bun
if (require.main === module) {
  main().catch(console.error);
}

// Export default for programmatic usage
export default setupGroundX;
