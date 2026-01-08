import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    // Don't attach token for auth endpoints or public car endpoints
    // Broad check for "cars/public" to handle various URL formats
    const isPublicEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("cars/public");

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 1. Clear invalid tokens
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // 2. Remove Authorization header to force guest mode
      if (originalRequest.headers) {
        // Handle AxiosHeaders object or plain object
        if (typeof originalRequest.headers.delete === 'function') {
          originalRequest.headers.delete("Authorization");
        } else {
          delete originalRequest.headers["Authorization"];
          originalRequest.headers["Authorization"] = undefined;
        }
      }

      try {
        // 3. Retry the request with the clean config
        // Using api() here might trigger request interceptors again, which is good 
        // because it will see no token in localStorage and default to guest
        return await api({
          ...originalRequest,
          // Ensure headers are clean in the new request object
          headers: originalRequest.headers
        });
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
