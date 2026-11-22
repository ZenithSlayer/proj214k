import { api } from "./client";

export const cartApi = {
  getCart: () => api.get("/cart"),

  addToCart: (productId, quantity) => api.post("/cart", { product_id: productId, quantity }),

  updateQuantity: (id, quantity) => api.put(`/cart/${id}`, { quantity }),

  remove: (id) => api.delete(`/cart/${id}`),

  checkout: () => api.post("/orders"),
};