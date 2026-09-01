import { request } from "./client.ts";

export const usersApi = {
  getMe: () => request("/users/me"),

  updateProfile: (data) => request("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data)
  }),

  deleteAccount: () => request("/users", { 
    method: "DELETE" 
  }),

  changePassword: (data) => request("/users/password", {
    method: "PUT",
    body: JSON.stringify(data)
  }),
};