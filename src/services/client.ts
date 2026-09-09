import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.241:3001";

const redirectToAuth = async (reason?: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
  } catch (error) {
    // ignore storage cleanup issues while redirecting
  }

  try {
    router.replace("/auth");
  } catch (error) {
    // ignore navigation issues in non-router contexts
  }
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

const normalizeError = async (response: Response) => {
  const errorData = await response.json().catch(() => ({}));
  const message = errorData.message || errorData.error || `Request failed with status ${response.status}`;

  if (["No token provided", "Invalid token", "Token expired", "Unauthorized"].some((value) => message.toLowerCase().includes(value.toLowerCase()))) {
    await redirectToAuth(message);
  }

  return new Error(message);
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
    throw await normalizeError(response);
  }

  return response.status === 204 ? {} : response.json();
};

export const upload = async (path: string, file: any) => {
  const token = await AsyncStorage.getItem("token");
  const body = new FormData();
  body.append("image", file);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });

  if (!response.ok) {
    throw await normalizeError(response);
  }

  return response.json();
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