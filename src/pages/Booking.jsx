import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getVehiculoById, createReserva, crearPago } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRD } from '../lib/format.js';
import { addDays, daysBetween, formatShortDate, isPast, todayISO } from '../lib/dates.js';
import VehicleThumb from '../components/VehicleThumb.jsx';

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const vehicleId = searchParams.get('vehiculo_id');
  const [payment, setPayment] = useState('azul');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(Boolean(vehicleId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Prefill desde la ficha del vehículo; si no viene nada, hoy + 2 días.
  const [form, setForm] = useState(() => {
    const inicio = searchParams.get('inicio') || todayISO();
    const seguro = isPast(inicio) ? todayISO() : inicio;
    return {
      fecha_inicio: seguro,
      fecha_fin: searchParams.get('fin') || addDays(seguro, 2),
      deposito: 500,
    };
  });
  const [card, setCard] = useState({ numero: '4242 4242 4242 4242', vencimiento: '12/27', cvv: '123' });
  // La reserva se crea una sola vez: si el pago se rechaza, se reintenta sobre la misma.
  const [reservaPendiente, setReservaPendiente] = useState(null);

  const days = useMemo(
    () => daysBetween(form.fecha_inicio, form.fecha_fin),
    [form.fecha_inicio, form.fecha_fin],
  );

  // Esto es lo que cobra POST /api/pagos: precio_dia x días. El depósito es aparte.
  const totalAlquiler = (vehicle?.price || 0) * days;

  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getVehiculoById(vehicleId)
      .then(data => setVehicle(normalizeVehicle(data)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const updateField = (field, value) => setForm(current => {
    const next = { ...current, [field]: value };
    // El backend exige fin > inicio: mover la recogida arrastra la devolución.
    if (field === 'fecha_inicio' && next.fecha_fin <= value) next.fecha_fin = addDays(value, 1);
    return next;
  });

  const updateCard = (field, value) => setCard(current => ({ ...current, [field]: value }));

  const handleCreateReserva = async () => {
    if (!vehicleId) {
      setError('Selecciona un vehículo antes de reservar.');
      return;
    }

    if (isPast(form.fecha_inicio)) {
      setError('La fecha de recogida no puede estar en el pasado.');
      return;
    }

    if (form.fecha_fin <= form.fecha_inicio) {
      setError('La devolución debe ser posterior a la recogida.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let reserva = reservaPendiente;

      if (!reserva) {
        reserva = await createReserva({
          vehiculo_id: Number(vehicleId),
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          deposito: Number(form.deposito),
        });
        setReservaPendiente(reserva);
      }

      // La reserva nace 'pendiente'; sin este cobro nunca pasa a 'confirmada'.
      const resultado = await crearPago({
        reserva_id: reserva.id,
        pasarela: payment,
        ...(payment === 'tpago'
          ? {}
          : {
              datos_tarjeta: {
                numero: card.numero.replace(/\s/g, ''),
                titular: user?.name || user?.nombre || '',
                vencimiento: card.vencimiento,
                cvv: card.cvv,
              },
            }),
      });

      if (resultado?.pago?.estado !== 'aprobado') {
        setError(resultado?.mensaje || 'El pago fue rechazado. Intenta de nuevo o elige otra pasarela.');
        return;
      }

      navigate('/confirmacion', {
        state: { reserva: resultado.reserva || reserva, vehicle, pago: resultado.pago },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Cargando reserva...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />Volver al vehículo
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</div>Selección
          </div>
          <div className="flex-1 h-px bg-slate-300 max-w-12" />
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</div>Pago
          </div>
          <div className="flex-1 h-px bg-slate-300 max-w-12" />
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm">3</div>Confirmación
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reserva y pago</h1>
            <p className="text-slate-500 mt-1">Revisa los datos y elige cómo pagar.</p>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Datos del conductor</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['Nombre', user?.name],
                  ['Cédula', user?.cedula],
                  ['Teléfono', user?.telefono],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="mt-1 font-semibold text-slate-900">{val || 'No registrado'}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Estos datos vienen de tu cuenta. Para cambiarlos hace falta editar el perfil.
              </p>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Método de pago</h3>
              <div className="space-y-2">
                {[
                  { id: 'azul',   label: 'Tarjeta · Azul',                  desc: 'Visa, Mastercard, débito',           badge: 'AZUL',   badgeColor: 'bg-blue-600' },
                  { id: 'tpago',  label: 'tPago',                           desc: 'Paga desde tu celular',              badge: 'tPago',  badgeColor: 'bg-emerald-500' },
                  { id: 'stripe', label: 'Tarjeta internacional · Stripe',  desc: 'Visa, Mastercard, Amex, Apple Pay',  badge: 'stripe', badgeColor: 'bg-violet-600' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                      payment === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`px-3 py-1.5 rounded-lg ${p.badgeColor} text-white text-xs font-bold`}>{p.badge}</div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-900 text-sm">{p.label}</div>
                      <div className="text-xs text-slate-500">{p.desc}</div>
                    </div>
                    {payment === p.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {payment !== 'tpago' && (
                <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-slate-100">
                  <div className="col-span-3">
                    <label className="text-sm font-medium text-slate-700">Número de tarjeta</label>
                    <input
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                      value={card.numero}
                      onChange={(event) => updateCard('numero', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Vence</label>
                    <input
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                      value={card.vencimiento}
                      onChange={(event) => updateCard('vencimiento', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">CVV</label>
                    <input
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                      value={card.cvv}
                      onChange={(event) => updateCard('cvv', event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-slate-100">
                <div>
                  <label className="text-sm font-medium text-slate-700">Inicio</label>
                  <input type="date" min={todayISO()} value={form.fecha_inicio} onChange={(event) => updateField('fecha_inicio', event.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Fin</label>
                  <input type="date" min={addDays(form.fecha_inicio, 1)} value={form.fecha_fin} onChange={(event) => updateField('fecha_fin', event.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Depósito</label>
                  <input type="number" value={form.deposito} onChange={(event) => updateField('deposito', event.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none" />
                </div>
              </div>

              {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button
                onClick={handleCreateReserva}
                disabled={saving}
                className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              >
                {saving
                  ? 'Procesando pago...'
                  : `${reservaPendiente ? 'Reintentar pago de' : 'Confirmar y pagar'} ${formatRD(totalAlquiler)}`}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
              <VehicleThumb vehicle={vehicle} className="rounded-xl aspect-video mb-4" iconClassName="w-16 h-16" />
              <div className="font-bold text-slate-900">{vehicle?.name || 'Vehículo seleccionado'}</div>
              <div className="text-xs text-slate-500">{vehicle?.type || 'Vehículo'} · {vehicle?.location || 'Ubicación no disponible'}</div>
              <div className="text-xs text-slate-500 mt-2">
                Periodo {formatShortDate(form.fecha_inicio)} - {formatShortDate(form.fecha_fin)}
              </div>

              <div className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between"><span className="text-slate-600">{formatRD(vehicle?.price || 0)} × {days} {days === 1 ? 'día' : 'días'}</span><span className="font-semibold">{formatRD(totalAlquiler)}</span></div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Se cobra ahora</span><span>{formatRD(totalAlquiler)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Depósito de garantía</span><span>{formatRD(Number(form.deposito || 0))}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-xs text-emerald-700">
                El depósito de {formatRD(Number(form.deposito || 0))} se reembolsa al devolver el vehículo en buen estado.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
