import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://backend-mo-nrnd.onrender.com";

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      const apiError: ApiError = {
        message:
          error.message || "Network error. Please check your connection.",
        status: 0,
      };
      return Promise.reject(apiError);
    }

    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response.status === 401) {
      localStorage.removeItem("mo_token");
      localStorage.removeItem("mo_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Extract error message from response
    const responseData = error.response.data as any;
    const message =
      responseData?.message ||
      responseData?.error ||
      error.response.statusText ||
      "An error occurred";

    const apiError: ApiError = {
      message,
      status: error.response.status,
      data: responseData,
    };

    return Promise.reject(apiError);
  },
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  profile: () => api.post("/auth/profile"),
};

export default api;
