import { request } from "./client.ts";

export const cartApi = {
  getCart: () => request("/cart"),

  addToCart: (productId, quantity) =>
    request("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateQuantity: (id, quantity) =>
    request(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  remove: (id) =>
    request(`/cart/${id}`, { method: "DELETE" }),

  checkout: (items, total) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ items, total }),
    }),
};