// API utility functions with authentication
const API_BASE_URL = "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const config: RequestInit = {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.token) {
            localStorage.setItem("auth_token", refreshData.token);
            if (refreshData.refreshToken) {
              localStorage.setItem("refresh_token", refreshData.refreshToken);
            }

            // Retry original request with new token
            const retryConfig: RequestInit = {
              ...options,
              headers: {
                Accept: "application/json",
                ...(options.body && !(options.body instanceof FormData)
                  ? { "Content-Type": "application/json" }
                  : {}),
                Authorization: `Bearer ${refreshData.token}`,
                ...options.headers,
              },
            };

            const retryResponse = await fetch(
              `${API_BASE_URL}${endpoint}`,
              retryConfig,
            );
            if (!retryResponse.ok) {
              throw new ApiError(
                retryResponse.status,
                `API call failed: ${retryResponse.statusText}`,
              );
            }

            const contentType = retryResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              return (await retryResponse.json()) as T;
            }
            return (await retryResponse.text()) as unknown as T;
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new ApiError(401, "Authentication failed");
      }
    } else {
      // No refresh token, redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw new ApiError(401, "Authentication required");
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API call failed: ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export const api = {
  get: <T = any>(endpoint: string) => apiCall<T>(endpoint, { method: "GET" }),
  post: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T = any>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T = any>(endpoint: string) =>
    apiCall<T>(endpoint, { method: "DELETE" }),
  upload: <T = any>(endpoint: string, formData: FormData) =>
    apiCall<T>(endpoint, {
      method: "POST",
      body: formData,
    }),
};
