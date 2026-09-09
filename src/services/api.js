import { request, upload } from "./client";

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, file) => upload(path, file),
};