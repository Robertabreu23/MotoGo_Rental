import { apiRequest } from './client.js';

export function register(data) {
  return apiRequest('/api/auth/register', { method: 'POST', body: data });
}

export function login(data) {
  return apiRequest('/api/auth/login', { method: 'POST', body: data });
}

export function loginWithGoogle(idToken) {
  return apiRequest('/api/auth/google', { method: 'POST', body: { idToken } });
}

export function getMe() {
  return apiRequest('/api/users/me', { protected: true });
}

export function getAdminOnly() {
  return apiRequest('/api/users/admin-only', { protected: true });
}

export function getVehiculos(filters = {}) {
  return apiRequest('/api/vehiculos', { params: filters });
}

export function getVehiculoById(id) {
  return apiRequest(`/api/vehiculos/${id}`);
}

export function getFavoritos() {
  return apiRequest('/api/favoritos', { protected: true });
}

export function addFavorito(vehiculoId) {
  return apiRequest('/api/favoritos', { method: 'POST', body: { vehiculoId }, protected: true });
}

export function removeFavorito(vehiculoId) {
  return apiRequest(`/api/favoritos/${vehiculoId}`, { method: 'DELETE', protected: true });
}

export function createVehiculo(data) {
  return apiRequest('/api/vehiculos', { method: 'POST', body: data, protected: true });
}

export function updateVehiculo(id, data) {
  return apiRequest(`/api/vehiculos/${id}`, { method: 'PATCH', body: data, protected: true });
}

export function deleteVehiculo(id) {
  return apiRequest(`/api/vehiculos/${id}`, { method: 'DELETE', protected: true });
}

export function getReservas() {
  return apiRequest('/api/reservas', { protected: true });
}

export function getReservaById(id) {
  return apiRequest(`/api/reservas/${id}`, { protected: true });
}

export function createReserva(data) {
  return apiRequest('/api/reservas', { method: 'POST', body: data, protected: true });
}

export function cancelarReserva(id) {
  return apiRequest(`/api/reservas/${id}/cancelar`, { method: 'PATCH', protected: true });
}

export function iniciarReserva(id) {
  return apiRequest(`/api/reservas/${id}/iniciar`, { method: 'PATCH', protected: true });
}

export function finalizarReserva(id) {
  return apiRequest(`/api/reservas/${id}/finalizar`, { method: 'PATCH', protected: true });
}
