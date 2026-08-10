import { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getReservas } from '../api/services.js';
import { normalizeReservation } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { themes } from '../lib/themes.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ClientPanel() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    getReservas()
      .then(data => setReservations((Array.isArray(data) ? data : []).map(normalizeReservation)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const activeCount = reservations.filter(r => ['En alquiler', 'Reservada', 'Activa', 'Pendiente'].includes(r.status)).length;
  const completedCount = reservations.filter(r => ['Finalizada', 'Completada'].includes(r.status)).length;
  const stats = [
    { label: 'Reservas activas',     value: activeCount,  color: 'from-blue-500 to-blue-700' },
    { label: 'Próximas',             value: reservations.length - completedCount,  color: 'from-emerald-500 to-teal-600' },
    { label: 'Viajes completados',   value: completedCount, color: 'from-violet-500 to-indigo-600' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-xs text-emerald-600 font-bold tracking-wider">PANEL DEL CLIENTE</div>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Hola, {user?.name || 'Usuario'} 👋</h1>
        <p className="text-slate-500 mt-1">Tienes {activeCount} reserva(s) activa(s).</p>

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
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">Activas y próximas</button>
            <button className="pb-3 text-slate-500 text-sm">Historial</button>
          </div>
          <div className="divide-y divide-slate-100">
            {loading && <div className="p-5 text-sm text-slate-500">Cargando reservas...</div>}
            {error && <div className="p-5 text-sm text-red-700">{error}</div>}
            {!loading && !error && reservations.map(r => {
              const t = themes[r.theme] || themes.emerald;
              return (
                <div key={r.id} className="p-5 flex items-center gap-4 hover:bg-slate-50">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.bg} flex items-center justify-center`}>
                    <Bike className={`w-7 h-7 ${t.icon}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{r.vehicleName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {r.dates} · <span className="font-mono">{r.id}</span>
                    </div>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Detalles
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
