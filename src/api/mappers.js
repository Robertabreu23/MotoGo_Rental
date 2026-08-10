import { formatDateRangeFromApi } from '../lib/dates.js';

const themeByType = {
  Motor: 'emerald',
  Deportivo: 'violet',
  Bicicleta: 'teal',
  Carro: 'sky',
};

export function normalizeVehicle(vehicle = {}) {
  const type = vehicle.type || vehicle.tipo || 'Motor';

  return {
    ...vehicle,
    id: vehicle.id ?? vehicle.vehiculo_id,
    name: vehicle.name || vehicle.nombre || 'Vehículo',
    location: vehicle.location || vehicle.ubicacion || 'Ubicación no disponible',
    rating: vehicle.rating ?? vehicle.calificacion ?? 4.8,
    trips: vehicle.trips ?? vehicle.viajes ?? 0,
    type,
    price: Number(vehicle.price ?? vehicle.precio_dia ?? 0),
    status: vehicle.status || vehicle.estado || 'Disponible',
    theme: vehicle.theme || themeByType[type] || 'emerald',
    description: vehicle.description || vehicle.descripcion || '',
    photos: vehicle.photos || vehicle.fotos || [],
  };
}

export function normalizeReservation(reservation = {}) {
  const vehicle = reservation.vehiculo || reservation.vehicle || {};
  const vehicleName = reservation.vehicleName || reservation.vehiculo_nombre || vehicle.nombre || vehicle.name || 'Vehículo';
  const vehicleType = vehicle.tipo || vehicle.type || 'Motor';

  return {
    ...reservation,
    id: reservation.id ?? reservation.reserva_id,
    codigo: reservation.codigo,
    precio_total: reservation.precio_total,
    // El vehículo embebido, normalizado, para poder mostrar su foto.
    vehicle: Object.keys(vehicle).length ? normalizeVehicle(vehicle) : null,
    vehicleId: reservation.vehicleId || reservation.vehiculo_id || vehicle.id,
    vehicleName,
    dates: reservation.dates || formatDateRangeFromApi(reservation.fecha_inicio, reservation.fecha_fin),
    status: reservation.estado || reservation.status || '',
    theme: reservation.theme || themeByType[vehicleType] || 'emerald',
    deposito: reservation.deposito,
    fecha_inicio: reservation.fecha_inicio,
    fecha_fin: reservation.fecha_fin,
  };
}

export function getUserRole(user = {}) {
  return user.role || user.rol || user.tipo || 'cliente';
}

export function getUserInitials(user = {}) {
  const name = user.name || user.nombre || user.correo || user.email || 'Usuario';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'US';
}
