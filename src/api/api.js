import axios from "axios";
import { tokenUtils } from "../utils/token";

const rawBaseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  "/api";

const api = axios.create({
  baseURL: rawBaseURL.replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;