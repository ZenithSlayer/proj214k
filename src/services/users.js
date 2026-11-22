import { api } from "./client";

export const usersApi = {
  getMe: () => api.get("/users/me"),

  updateProfile: (data) => api.put("/users/profile", data),

  deleteAccount: () => api.delete("/users"),

  changePassword: (data) => api.put("/users/password", data),
};