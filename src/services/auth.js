import { request } from "./client.ts";

export const authApi = {
  login: (credentials) => 
    request("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) => 
    request("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};