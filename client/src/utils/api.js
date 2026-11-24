import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Har request bhejne se pehle check karega ki kya VIP Pass (token) saved hai?
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;