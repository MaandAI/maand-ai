import axios from "axios";

/**
 * Centralized API Client
 * Includes interceptors for consistent error handling and authentication.
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "An unexpected error occurred";
    // You can add global toast notifications here
    return Promise.reject(new Error(message));
  }
);

export default api;
