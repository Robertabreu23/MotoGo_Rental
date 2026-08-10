// Vocabulario exacto de la API. Las reservas viven en minúscula y los
// vehículos capitalizados; mezclarlos fue la causa de contadores en cero.

export const RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  EN_CURSO: 'en_curso',
  FINALIZADA: 'finalizada',
  CANCELADA: 'cancelada',
};

export const RESERVA_LABEL = {
  [RESERVA.PENDIENTE]: 'Pendiente de pago',
  [RESERVA.CONFIRMADA]: 'Confirmada',
  [RESERVA.EN_CURSO]: 'En curso',
  [RESERVA.FINALIZADA]: 'Finalizada',
  [RESERVA.CANCELADA]: 'Cancelada',
};

/** El vehículo está en la calle ahora mismo. */
export const ACTIVAS = [RESERVA.EN_CURSO];
/** Todavía no empieza pero cuenta como compromiso. */
export const PROXIMAS = [RESERVA.PENDIENTE, RESERVA.CONFIRMADA];
export const CERRADAS = [RESERVA.FINALIZADA, RESERVA.CANCELADA];

export const VEHICULO = {
  DISPONIBLE: 'Disponible',
  EN_ALQUILER: 'En alquiler',
  EN_MANTENIMIENTO: 'En mantenimiento',
};

export function esReservaCancelable(estado) {
  return PROXIMAS.includes(estado);
}
