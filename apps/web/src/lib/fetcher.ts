import { getToken } from "@/lib/clerk";

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const CHAT_API_URL = `${API_BASE_URL}/api/chat`;

// Custom fetcher for API calls with authentication
export async function customFetcher(input: RequestInfo | URL, init?: RequestInit) {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
