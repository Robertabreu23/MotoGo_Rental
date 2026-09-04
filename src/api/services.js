import { apiRequest } from './client.js';
//this is a small change to see if it blocks de merge
export function register(data) {
  return apiRequest('/api/auth/register', { method: 'POST', body: data, authAttempt: true });
}

export function login(data) {
  return apiRequest('/api/auth/login', { method: 'POST', body: data, authAttempt: true });
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

export function getReservas(filters = {}) {
  return apiRequest('/api/reservas', { params: filters, protected: true });
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

// data opcional: { fotos_urls, combustible_pct, notas } — crea el RegistroEstado de entrega.
export function iniciarReserva(id, data = {}) {
  return apiRequest(`/api/reservas/${id}/iniciar`, { method: 'PATCH', body: data, protected: true });
}

// data opcional: { danios_reportados, notas, fotos_urls, combustible_pct } — devuelve el reembolso del depósito.
export function finalizarReserva(id, data = {}) {
  return apiRequest(`/api/reservas/${id}/finalizar`, { method: 'PATCH', body: data, protected: true });
}

export function crearPago(data) {
  return apiRequest('/api/pagos', { method: 'POST', body: data, protected: true });
}

export function getPagosByReserva(reservaId) {
  return apiRequest(`/api/pagos/reserva/${reservaId}`, { protected: true });
}

export function getMantenimientos(filters = {}) {
  return apiRequest('/api/mantenimientos', { params: filters, protected: true });
}

export function getMantenimientoById(id) {
  return apiRequest(`/api/mantenimientos/${id}`, { protected: true });
}

export function createMantenimiento(data) {
  return apiRequest('/api/mantenimientos', { method: 'POST', body: data, protected: true });
}

export function updateMantenimiento(id, data) {
  return apiRequest(`/api/mantenimientos/${id}`, { method: 'PATCH', body: data, protected: true });
}
