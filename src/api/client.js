const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'motogo_token';
const AUTH_EVENT = 'motogo:unauthorized';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function onUnauthorized(handler) {
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}

function buildUrl(path, params) {
  const url = new URL(path, API_URL);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  return url.toString();
}

function getErrorMessage(status, payload) {
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  return payload?.message || payload?.error || 'Ocurrió un error al comunicarse con el servidor.';
}

export async function apiRequest(path, { method = 'GET', body, params, protected: protectedRoute = false } = {}) {
  const token = getToken();
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (protectedRoute || token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(`No se pudo conectar con el backend. Verifica que esté corriendo en ${API_URL} y que CORS permita el frontend.`);
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent(AUTH_EVENT));
    }

    const error = new Error(getErrorMessage(response.status, payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
}
