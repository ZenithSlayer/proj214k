import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.0.241:3001";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export const request = async (path: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? {} : response.json();
};

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: any) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (path: string, body: any) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};