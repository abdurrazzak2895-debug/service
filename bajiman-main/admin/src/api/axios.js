import axios from "axios";

export const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    const isAuthEndpoint = /\/(login|register|forgot-password)(?:\/|$|\?)/i.test(url);

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
