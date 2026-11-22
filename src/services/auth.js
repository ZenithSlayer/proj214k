import { api } from "./client";

export const authApi = {
  login: (credentials) => api.post("/users/login", credentials),

  register: (userData) => api.post("/users/register", userData),
};