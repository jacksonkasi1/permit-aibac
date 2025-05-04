import axios, { AxiosInstance } from "axios";
import { GroundXEnv } from "./types";
import { logger } from "@repo/logs";

/**
 * Default GroundX API URL
 */
const DEFAULT_BASE_URL = "https://api.groundx.ai/api/v1";

/**
 * GroundX API Client class for managing connections to the GroundX API
 */
export class GroundXClient {
  private apiKey: string;
  private baseURL: string;
  private client: AxiosInstance;
  public defaultBucketId?: number;

  /**
   * Create a new GroundX client instance
   */
  constructor(config: GroundXEnv) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || DEFAULT_BASE_URL;
    this.defaultBucketId = config.defaultBucketId;

    if (!this.apiKey) {
      throw new Error("GroundX API key is required");
    }

    // Initialize axios client
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error({
            status: error.response.status,
            data: error.response.data,
            url: error.config.url,
            method: error.config.method,
          }, "GroundX API error");
        } else {
          logger.error({ error: error.message }, "GroundX network error");
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the axios client instance for direct API access
   */
  getClient(): AxiosInstance {
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