import { request } from "./client";

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isFavorite?: boolean;
}

export const addressesApi = {
  
  create: (data: Address): Promise<Address> => 
    request("/users/address", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (id: string, data: Partial<Address>): Promise<Address> => 
    request(`/users/address/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  delete: (id: string): Promise<void> => 
    request(`/users/address/${id}`, { 
      method: "DELETE" 
    }),
  
  setFavorite: (id: string): Promise<Address> => 
    request(`/users/address/${id}/favorite`, { 
      method: "PUT" 
    }),
};