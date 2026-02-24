import axios from "axios";
import { auth } from "./firebase";

export const apiClient = axios.create({
  baseURL: "/api",
});

// Automatically inject valid Firebase tokens
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
