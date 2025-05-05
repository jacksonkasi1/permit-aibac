import { getToken } from "@/lib/clerk";
import { toast } from "sonner";

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const CHAT_API_URL = `${API_BASE_URL}/api/chat`;

// Custom fetcher for API calls with authentication
export async function customFetcher(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const token = await getToken();
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    } else {
      // If no token is available, show authentication error
      toast.error("Authentication required. Please sign in to continue.");
      throw new Error("Authentication required");
    }

    const response = await fetch(input, {
      ...init,
      headers,
    });

    // Handle authentication and other common errors
    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Authentication required. Please sign in to continue.");
        throw new Error("Authentication required");
      } else if (response.status === 403) {
        toast.error("You don't have permission to perform this action.");
        throw new Error("Permission denied");
      } else {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.message || data?.error || `Error: ${response.statusText}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    return response;
  } catch (error) {
    // Make sure errors are always displayed to the user
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    
    // Only show toast if it's not already shown by the code above
    if (!message.includes("Authentication required") && 
        !message.includes("Permission denied")) {
      toast.error(message);
    }
    
    throw error;
  }
}
