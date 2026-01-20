import { tokenStorage } from "@/services/tokenStorage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5102/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//try catch cho axios ở các request
api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

api.interceptors.request.use(config => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 sau này dùng cho auth / refresh token
// api.interceptors.request.use(...)
// api.interceptors.response.use(...)

export default api;
