import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me")
};

export const profileApi = {
  getAnalytics: (handle) => api.get("/profile/analytics", { params: { handle } }),
  getMyAnalytics: () => api.get("/profile/me"),
  updateHandle: (handle) => api.put("/profile/handle", { handle }),
  compare: (handle) => api.get(`/profile/compare/${encodeURIComponent(handle)}`)
};

export const friendsApi = {
  list: () => api.get("/friends"),
  add: (handle) => api.post("/friends/add", { handle }),
  remove: (handle) => api.delete(`/friends/${encodeURIComponent(handle)}`)
};

export const recommendationsApi = {
  generate: (friendHandle = null) => api.post("/recommendations", { friendHandle })
};

export default api;
