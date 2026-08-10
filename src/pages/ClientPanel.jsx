import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelarReserva, getReservas } from '../api/services.js';
import { normalizeReservation } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRD } from '../lib/format.js';
import { ACTIVAS, CERRADAS, PROXIMAS, esReservaCancelable } from '../lib/estados.js';
import StatusBadge from '../components/StatusBadge.jsx';
import VehicleThumb from '../components/VehicleThumb.jsx';

export default function ClientPanel() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isStaff = role === 'operador' || role === 'admin';
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState('activas');
  const [cancelingId, setCancelingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getReservas()
      .then(data => setReservations((Array.isArray(data) ? data : []).map(normalizeReservation)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelar = async (id) => {
    setCancelingId(id);
    setError(null);

    try {
      const actualizada = await cancelarReserva(id);
      const normalizada = normalizeReservation(actualizada);
      setReservations(current => current.map(r => (r.id === id ? normalizada : r)));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  const activas = reservations.filter(r => ACTIVAS.includes(r.status));
  const proximas = reservations.filter(r => PROXIMAS.includes(r.status));
  const cerradas = reservations.filter(r => CERRADAS.includes(r.status));

  const stats = [
    { label: 'Reservas en curso', value: activas.length,  color: 'from-blue-500 to-blue-700' },
    { label: 'Próximas',          value: proximas.length, color: 'from-emerald-500 to-teal-600' },
    { label: 'Viajes completados', value: reservations.filter(r => r.status === 'finalizada').length, color: 'from-violet-500 to-indigo-600' },
  ];

  const visibles = tab === 'activas' ? [...activas, ...proximas] : cerradas;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-xs text-emerald-600 font-bold tracking-wider">PANEL DEL CLIENTE</div>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Hola, {user?.name || 'Usuario'} 👋</h1>
        <p className="text-slate-500 mt-1">
          {activas.length > 0
            ? `Tienes ${activas.length} reserva(s) en curso.`
            : proximas.length > 0
              ? `Tienes ${proximas.length} reserva(s) próxima(s).`
              : 'No tienes reservas activas.'}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl p-6 bg-gradient-to-br ${s.color} text-white`}>
              <div className="text-sm opacity-90">{s.label}</div>
              <div className="text-4xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-6 px-6 pt-5 border-b border-slate-100">
            {[
              ['activas', `Activas y próximas (${activas.length + proximas.length})`],
              ['historial', `Historial (${cerradas.length})`],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`pb-3 text-sm ${
                  tab === id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {loading && <div className="p-5 text-sm text-slate-500">Cargando reservas...</div>}
            {error && <div className="p-5 text-sm text-red-700">{error}</div>}
            {!loading && !error && visibles.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  {tab === 'activas' ? 'No tienes reservas activas ni próximas.' : 'Todavía no tienes viajes cerrados.'}
                </p>
                {tab === 'activas' && (
                  <button
                    onClick={() => navigate('/catalogo')}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                  >
                    Explorar catálogo
                  </button>
                )}
              </div>
            )}

            {!loading && !error && visibles.map(r => {
              return (
                <div key={r.id} className="p-5 flex flex-wrap items-center gap-4 hover:bg-slate-50">
                  <VehicleThumb
                    vehicle={r.vehicle || { theme: r.theme, name: r.vehicleName }}
                    className="w-14 h-14 rounded-xl shrink-0"
                    iconClassName="w-7 h-7"
                  />
                  <div className="flex-1 min-w-[180px]">
                    <div className="font-bold text-slate-900">{r.vehicleName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {r.dates}
                      {r.codigo && <> · <span className="font-mono">{r.codigo}</span></>}
                      {r.precio_total && <> · {formatRD(Number(r.precio_total))}</>}
                    </div>
                    {/* El staff ve reservas de todos: sin esto no sabe de quién es cuál. */}
                    {isStaff && r.cliente && (
                      <div className="text-xs text-slate-700 mt-1">
                        <span className="font-semibold">{r.cliente.nombre}</span>
                        {r.cliente.telefono && <span className="text-slate-500"> · {r.cliente.telefono}</span>}
                        {r.cliente.correo && <span className="text-slate-500"> · {r.cliente.correo}</span>}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                  {esReservaCancelable(r.status) && (
                    <button
                      onClick={() => handleCancelar(r.id)}
                      disabled={cancelingId === r.id}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {cancelingId === r.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                  {r.vehicleId && (
                    <button
                      onClick={() => navigate(`/vehiculo/${r.vehicleId}`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Ver vehículo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
