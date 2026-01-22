import { tokenStorage } from "@/services/tokenStorage";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

//try catch cho axios ở các request
api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.Message ||
      err.response?.data ||
      err.message ||
      "Unknown error";

    err.message = message; // ✅ giữ nguyên AxiosError
    return Promise.reject(err);
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
