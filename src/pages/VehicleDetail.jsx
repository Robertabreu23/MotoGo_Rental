import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Pencil, Star } from 'lucide-react';
import { getReservas, getVehiculoById } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { themes } from '../lib/themes.js';
import { formatRD } from '../lib/format.js';
import { addDays, daysBetween, diasDelRango, formatMonthYear, formatShortDate, isPast, monthGrid, todayISO, toISODateFromApi } from '../lib/dates.js';
import { PROXIMAS, RESERVA } from '../lib/estados.js';
import StatusBadge from '../components/StatusBadge.jsx';
import VehicleIcon from '../components/VehicleIcon.jsx';
import VehicleFormDialog from '../components/VehicleFormDialog.jsx';

export default function VehicleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, role, isAuthenticated } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [range, setRange] = useState({ inicio: todayISO(), fin: addDays(todayISO(), 3) });
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [ocupados, setOcupados] = useState(() => new Set());
  const [conflicto, setConflicto] = useState(false);

  const handlePickDay = (iso) => {
    setConflicto(false);

    setRange(current => {
      // Con el rango ya cerrado, o al hacer clic antes del inicio, se empieza de nuevo.
      if (current.fin || iso <= current.inicio) return { inicio: iso, fin: '' };

      // No se puede saltar por encima de días ya reservados.
      if (diasDelRango(current.inicio, iso).some(dia => ocupados.has(dia))) {
        setConflicto(true);
        return current;
      }

      return { ...current, fin: iso };
    });
  };

  useEffect(() => {
    // El endpoint exige token. Sin sesión no hay forma de saber qué días están tomados.
    if (!isAuthenticated) return;

    let active = true;

    getReservas({ vehiculo_id: id })
      .then(data => {
        if (!active) return;

        // El filtro por vehículo solo lo aplica el backend para staff: refiltramos aquí.
        const bloqueantes = (Array.isArray(data) ? data : []).filter(r => {
          const vehiculoId = r.vehiculo_id ?? r.vehiculo?.id;
          const bloquea = [...PROXIMAS, RESERVA.EN_CURSO].includes(r.estado);
          return String(vehiculoId) === String(id) && bloquea;
        });

        const dias = new Set();
        bloqueantes.forEach(r => {
          const inicio = toISODateFromApi(r.fecha_inicio);
          const fin = toISODateFromApi(r.fecha_fin);
          if (inicio && fin) diasDelRango(inicio, fin).forEach(dia => dias.add(dia));
        });

        setOcupados(dias);
      })
      .catch(() => {
        // Si falla, el calendario sigue usable: el backend valida igual al reservar.
      });

    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  const shiftMonth = (delta) => {
    setMonthCursor(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    getVehiculoById(id)
      .then(data => setVehicle(normalizeVehicle(data)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Cargando vehículo...</div>;
  if (error) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-red-700">{error}</div>;
  if (!vehicle) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Vehículo no encontrado.</div>;

  const v = vehicle;
  const t = themes[v.theme] || themes.emerald;
  // Mismas reglas que el backend: propietario, operador o admin.
  const isStaff = role === 'operador' || role === 'admin';
  const isOwner = Boolean(user?.id) && v.propietario_id === user.id;
  const canEdit = isStaff || isOwner;
  const photos = v.photos || [];
  const today = todayISO();
  const now = new Date();
  const isCurrentMonth = monthCursor.getFullYear() === now.getFullYear() && monthCursor.getMonth() === now.getMonth();
  const days = range.fin ? daysBetween(range.inicio, range.fin) : 1;
  const subtotal = v.price * days;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-sm text-slate-500 mb-4">
          <Link to="/catalogo" className="cursor-pointer hover:text-blue-600">Catálogo</Link>
          {' '}/ {v.type} / <span className="text-slate-900 font-medium">{v.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div>
            <div className={`rounded-3xl bg-gradient-to-br ${t.bg} aspect-[16/10] flex items-center justify-center relative overflow-hidden`}>
              {photos.length > 0 ? (
                <img
                  src={photos[activePhoto] || photos[0]}
                  alt={v.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <VehicleIcon type={v.type} theme={v.theme} className="w-48 h-48" />
              )}
              <div className="absolute top-4 left-4"><StatusBadge status={v.status} /></div>
            </div>

            {photos.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-3">
                {photos.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setActivePhoto(index)}
                    className={`rounded-xl overflow-hidden aspect-[4/3] border-2 transition ${
                      index === activePhoto ? 'border-blue-600' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={url} alt={`${v.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900">{v.name}</h1>
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="shrink-0 px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">{v.rating}</span> ({v.trips} viajes)
                </span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{v.location}</span>
              </div>
              <p className="text-slate-600 mt-4">
                {v.description || 'Este vehículo todavía no tiene descripción.'}
              </p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  ['Tipo', v.type],
                  ['Estado', v.status],
                  ['Precio por día', formatRD(v.price)],
                ].map(([k, val]) => (
                  <div key={k} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="font-bold text-slate-900 mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900">Disponibilidad y punto de recogida</h3>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => shiftMonth(-1)}
                      disabled={isCurrentMonth}
                      aria-label="Mes anterior"
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="font-semibold text-slate-700 text-sm first-letter:uppercase">{formatMonthYear(monthCursor)}</div>
                    <button
                      onClick={() => shiftMonth(1)}
                      aria-label="Mes siguiente"
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div key={i} className="text-slate-400 font-semibold py-1">{d}</div>
                    ))}
                    {monthGrid(monthCursor).map((iso, i) => {
                      if (!iso) return <div key={`empty-${i}`} />;

                      const day = Number(iso.slice(8));
                      const past = isPast(iso);
                      const reservado = ocupados.has(iso);
                      const inRange = range.fin && iso > range.inicio && iso < range.fin;
                      const isEdge = iso === range.inicio || iso === range.fin;

                      return (
                        <button
                          key={iso}
                          onClick={() => handlePickDay(iso)}
                          disabled={past || reservado}
                          title={reservado ? 'Ya reservado' : undefined}
                          className={`py-1.5 rounded ${
                            reservado ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                              : isEdge ? 'bg-blue-600 text-white font-bold'
                              : inRange ? 'bg-blue-100 text-blue-700'
                              : past ? 'text-slate-300 cursor-not-allowed'
                              : iso === today ? 'text-blue-600 font-bold ring-1 ring-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-600" /> Recogida y devolución
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-100" /> Días del alquiler
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-slate-200" /> No seleccionable
                    </div>
                    {ocupados.size > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                        <span className="line-through">Reservado</span>
                      </div>
                    )}
                  </div>
                  {conflicto ? (
                    <p className="text-xs mt-3 text-red-600 font-medium">
                      Ese rango incluye días ya reservados. Elige una devolución antes del próximo bloque ocupado.
                    </p>
                  ) : (
                    <p className={`text-xs mt-3 ${range.fin ? 'text-slate-500' : 'text-blue-600 font-medium'}`}>
                      {range.fin
                        ? `Del ${formatShortDate(range.inicio)} al ${formatShortDate(range.fin)}. Haz clic en otro día para empezar de nuevo.`
                        : 'Ahora elige la fecha de devolución.'}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {isAuthenticated
                      ? 'La disponibilidad se confirma al reservar.'
                      : 'Inicia sesión para ver los días ya reservados.'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl p-5 relative">
                  <MapPin className="w-8 h-8 text-emerald-600" />
                  <div className="mt-2 font-bold text-slate-900">{v.location}</div>
                  <div className="text-xs text-slate-600 mt-1">Punto de recogida y devolución</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{formatRD(v.price)}</span>
                <span className="text-slate-500"> / día</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="border border-slate-200 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-500 font-semibold">RECOGIDA</div>
                  <div className="text-sm font-semibold text-slate-900">{formatShortDate(range.inicio)}</div>
                </div>
                <div className="border border-slate-200 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-500 font-semibold">DEVOLUCIÓN</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {range.fin ? formatShortDate(range.fin) : 'Elige en el calendario'}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{formatRD(v.price)} × {days} {days === 1 ? 'día' : 'días'}</span>
                  <span className="font-semibold text-slate-900">{formatRD(subtotal)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total del alquiler</span>
                  <span>{formatRD(subtotal)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  El depósito de garantía se define al reservar y se reembolsa al devolver el vehículo.
                </p>
              </div>

              <button
                onClick={() => navigate(`/reserva?vehiculo_id=${v.id}&inicio=${range.inicio}&fin=${range.fin || addDays(range.inicio, 1)}`)}
                className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Reservar ahora
              </button>
              <div className="mt-3 text-xs text-slate-500 text-center">Sin cargos hasta que confirmes</div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <VehicleFormDialog
          vehicle={v}
          onClose={() => setEditing(false)}
          onSaved={setVehicle}
        />
      )}
    </div>
  );
}
