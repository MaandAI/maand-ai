import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
});

// NextAuth uses session cookies automatically for same-origin requests.
// No need to manually inject tokens unless calling external services.
apiClient.interceptors.request.use((config) => {
  return config;
});
