import { api } from "./client";

export interface Address {
  id?: number;
  country: string;
  street: string;
  city: string;
  state: string;
  number: string;
  postal_code?: string;
  is_favorite?: boolean | number;
}

type AddressMutationResult = { message: string };

export const addressesApi = {
  create: (data: Address): Promise<AddressMutationResult> => api.post("/users/address", data),

  update: (id: number, data: Partial<Address>): Promise<AddressMutationResult> => api.put(`/users/address/${id}`, data),

  delete: (id: number): Promise<AddressMutationResult> => api.delete(`/users/address/${id}`),

  setFavorite: (id: number): Promise<AddressMutationResult> => api.put(`/users/address/${id}/favorite`),
};