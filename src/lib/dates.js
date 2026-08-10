const LOCALE = 'es-DO';

function pad(value) {
  return String(value).padStart(2, '0');
}

/** Date -> 'YYYY-MM-DD' usando la hora local (no UTC). */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 'YYYY-MM-DD' -> Date a medianoche local.
 * new Date('2026-08-10') se parsea como UTC y en RD (UTC-4) cae un día antes.
 */
export function fromISODate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(iso, days) {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Días completos entre dos fechas ISO. Mínimo 1: un alquiler siempre cuenta un día. */
export function daysBetween(startISO, endISO) {
  const diff = Math.ceil((fromISODate(endISO) - fromISODate(startISO)) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

/**
 * Días ISO del intervalo [inicio, fin): el día de devolución queda libre,
 * igual que en la validación de solapamiento del backend.
 */
export function diasDelRango(startISO, endISO) {
  const dias = [];
  let cursor = startISO;

  // Tope defensivo: una reserva corrupta no debe colgar el render.
  while (cursor < endISO && dias.length < 400) {
    dias.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dias;
}

export function isPast(iso) {
  return fromISODate(iso) < fromISODate(todayISO());
}

/** '2026-08-10' -> '10 ago' */
export function formatShortDate(iso) {
  if (!iso) return '';
  return fromISODate(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/** '2026-08-10' -> '10 de agosto de 2026' */
export function formatLongDate(iso) {
  if (!iso) return '';
  return fromISODate(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Date -> 'agosto 2026' */
export function formatMonthYear(date) {
  return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

/** Fecha ISO de una reserva del backend (viene como date-time) -> 'YYYY-MM-DD'. */
export function toISODateFromApi(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : toISODate(date);
}

/** Rango legible para una reserva: '10 ago - 13 ago'. */
export function formatDateRangeFromApi(startValue, endValue) {
  const start = toISODateFromApi(startValue);
  const end = toISODateFromApi(endValue);
  if (!start && !end) return 'Fechas por confirmar';
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

/**
 * Celdas de un mes para pintar un calendario con la semana empezando en lunes.
 * Devuelve nulls al inicio para alinear el día 1.
 */
export function monthGrid(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];
}
