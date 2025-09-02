import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const authData = localStorage.getItem("auth");

  if (authData) {
    const { token, expiry } = JSON.parse(authData);

    // If expired, remove from localStorage
    if (Date.now() > expiry) {
      localStorage.removeItem("auth");
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default axiosInstance;