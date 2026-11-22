import { api } from "./client";

export const productsApi = {
  getAll: () => api.get("/products"),

  getAllTags: () => api.get("/products/tag"),

  getAllCategory: (id) => api.get(`/products/tag/${id}`),

  getById: (id) => api.get(`/products/${id}`),
};