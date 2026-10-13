import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:51800/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de peticiones: Adjunta JWT Bearer desde almacenamiento seguro
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('bufalos_auth_token') || localStorage.getItem('bufalos_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: Normalización de errores y gestión de sesión
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]>; detail?: string }>) => {
    const status = error.response?.status || 500;
    let message = 'Error de conexión con el servidor. Verifique si la API está en ejecución.';

    if (error.response?.data) {
      const data = error.response.data;
      message = data.message || data.error || data.detail || message;
    }

    if (status === 401) {
      message = 'Sesión no autorizada o token expirado. Por favor, inicie sesión nuevamente.';
      // Limpiar credenciales caducadas
      sessionStorage.removeItem('bufalos_auth_token');
      sessionStorage.removeItem('bufalos_auth_user');
      localStorage.removeItem('bufalos_auth_token');
      localStorage.removeItem('bufalos_auth_user');

      // Si no estamos ya en la página de login, disparar evento o redirección controlada
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.dispatchEvent(new CustomEvent('bufalos:unauthorized'));
      }
    } else if (status === 403) {
      message = 'Acceso denegado: Su rol no cuenta con los permisos necesarios para realizar esta acción.';
    } else if (status === 429) {
      message = 'Límite de solicitudes alcanzado (Rate Limit). Por favor espere 1 minuto antes de reintentar.';
    }

    const normalizedError: ApiError = {
      status,
      message,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  }
);
