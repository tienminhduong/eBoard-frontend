import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5102/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 sau này dùng cho auth / refresh token
// api.interceptors.request.use(...)
// api.interceptors.response.use(...)

export default api;
