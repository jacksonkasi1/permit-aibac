import { Permit } from "permitio";

// Initialize Permit.io client
const permit = new Permit({
  // Use PDP URL from environment or default to cloud PDP
  pdp: process.env.PERMIT_PDP_URL || "https://cloudpdp.api.permit.io",
  token: process.env.PERMIT_API_KEY || "",
});

// Export Permit client for use in other modules
export { permit };

// Export middleware for API routes
export * from "./middleware";

// Export utility functions
export * from "./utils";

// Export types
export * from "./types";
