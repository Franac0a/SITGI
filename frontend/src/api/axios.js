import axios from "axios";

const api = axios.create({
  // URL base de tu backend
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  
  withCredentials: true,
  
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
    }
    return Promise.reject(error);
  }
);

export default api;