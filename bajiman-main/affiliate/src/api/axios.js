import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("affiliate_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// এই এন্ডপয়েন্টগুলোতে 401 এলে auto-logout করা হবে না (ভুল পাসওয়ার্ড/OTP এর কারণেও 401 আসতে পারে)
// path segment হিসেবে ম্যাচ করে, যাতে "/affiliate-login-settings" এর মতো নাম ভুলবশত ধরা না পড়ে
const AUTH_ENDPOINT_RE = /\/(login|register|forgot-password)(?:\/|$|\?)/i;
const isAuthEndpoint = (url = "") => AUTH_ENDPOINT_RE.test(url);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401 && !isAuthEndpoint(url)) {
      localStorage.removeItem("affiliate_user");
      localStorage.removeItem("affiliate_token");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;