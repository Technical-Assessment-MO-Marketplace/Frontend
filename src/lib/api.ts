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
  createAdmin: (data: { email: string; password: string }) =>
    api.post("/auth/admin/create", data),
};

// Products API
export const productsApi = {
  getAll: () => api.get("/products"),
  getVariants: (productId: number) =>
    api.get(`/products/${productId}/variants`),
  getProductAttributes: (productId: number) =>
    api.get(`/products/${productId}/attributes`),
  filterVariants: (productId: number, attributeValueIds: number[]) =>
    api.post(`/products/${productId}/variants/filter`, {
      attributeValueIds,
    }),
};

// Admin Products API
export const adminProductsApi = {
  create: (data: { name: string; description: string }) =>
    api.post("/admin/products", data),
  update: (productId: number, data: { name: string; description: string }) =>
    api.patch(`/admin/products/${productId}`, data),
  delete: (productId: number) => api.delete(`/admin/products/${productId}`),
  createVariant: (
    productId: number,
    data: {
      price: number;
      stock: number;
      attributeValueIds: number[];
    },
  ) => api.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (
    productId: number,
    variantId: number,
    data: { stock: number },
  ) => api.patch(`/admin/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId: number, variantId: number) =>
    api.delete(`/admin/products/${productId}/variants/${variantId}`),
};

// Admin Attributes API
export const adminAttributesApi = {
  create: (data: { name: string }) => api.post("/admin/attributes", data),
  getAll: () => api.get("/admin/attributes"),
  delete: (attributeId: number) =>
    api.delete(`/admin/attributes/${attributeId}`),
  getValues: (attributeId: number) =>
    api.get(`/admin/attributes/attribute/${attributeId}/values`),
  addValue: (attributeId: number, data: { value: string }) =>
    api.post(`/admin/attributes/${attributeId}/values`, data),
  deleteValue: (valueId: number) =>
    api.delete(`/admin/attributes/values/${valueId}`),
};

// Orders API
export const ordersApi = {
  create: (data: {
    items: Array<{
      product_id: number;
      variant_id: number;
      quantity: number;
    }>;
  }) => api.post("/orders", data),
  getAll: () => api.get("/orders"),
};

export default api;
