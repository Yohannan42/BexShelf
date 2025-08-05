const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    // Return null for 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
} 