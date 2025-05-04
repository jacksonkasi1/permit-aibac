import { logger } from "@repo/logs";
import { GroundXClient as GroundXSDK } from "groundx";
import { GroundXEnv } from "./types";

/**
 * GroundX API Client class for managing connections to the GroundX API
 */
export class GroundXClient {
  private apiKey: string;
  private baseURL?: string;
  private client: GroundXSDK;
  public defaultBucketId?: number;

  /**
   * Create a new GroundX client instance
   */
  constructor(config: GroundXEnv) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.defaultBucketId = config.defaultBucketId;

    if (!this.apiKey) {
      throw new Error("GroundX API key is required");
    }

    // Initialize the official GroundX client with the API key
    this.client = new GroundXSDK({
      apiKey: this.apiKey,
      environment: this.baseURL,
    });

    logger.info(
      {
        baseURL: this.baseURL || "default GroundX API URL",
        defaultBucketId: this.defaultBucketId,
      },
      "GroundX client initialized",
    );
  }

  /**
   * Get the GroundX client instance for direct API access
   */
  getClient(): GroundXSDK {
    return this.client;
  }
}

/**
 * Create a singleton GroundX client instance
 */
let groundXClient: GroundXClient | null = null;

/**
 * Initialize the GroundX client with configuration
 */
export function initGroundXClient(config: GroundXEnv): GroundXClient {
  groundXClient = new GroundXClient(config);
  return groundXClient;
}

/**
 * Get the GroundX client instance
 * Will throw error if client has not been initialized
 */
export function getGroundXClient(): GroundXClient {
  if (!groundXClient) {
    throw new Error("GroundX client has not been initialized. Call initGroundXClient first.");
  }
  return groundXClient;
}
