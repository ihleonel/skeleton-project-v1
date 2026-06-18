import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,          // sends session cookie automatically
  headers: { "Content-Type": "application/json" },
});

// Attach CSRF token to mutating requests (Django requires it)
api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken && config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default api;
