import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, ClipboardList, Package, TrendingUp, Wrench } from 'lucide-react';
import { getMantenimientos, getReservas, getVehiculos } from '../api/services.js';
import { normalizeReservation, normalizeVehicle } from '../api/mappers.js';
import { formatRD } from '../lib/format.js';
import { formatShortDate, fromISODate, toISODateFromApi } from '../lib/dates.js';
import { RESERVA, VEHICULO } from '../lib/estados.js';
import StatusBadge from '../components/StatusBadge.jsx';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
// Una reserva cuenta como ingreso solo si el alquiler ya se cobró.
const COBRADAS = [RESERVA.CONFIRMADA, RESERVA.EN_CURSO, RESERVA.FINALIZADA];

export default function AdminDashboard() {
  const [vehiculos, setVehiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getVehiculos(), getReservas(), getMantenimientos()])
      .then(([v, r, m]) => {
        setVehiculos((Array.isArray(v) ? v : []).map(normalizeVehicle));
        setReservas((Array.isArray(r) ? r : []).map(normalizeReservation));
        setMantenimientos(Array.isArray(m) ? m : []);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Cargando métricas...</div>;

  const ahora = new Date();
  const cobradas = reservas.filter(r => COBRADAS.includes(r.status));

  const esteMes = cobradas.filter(r => {
    const iso = toISODateFromApi(r.fecha_inicio);
    if (!iso) return false;
    const fecha = fromISODate(iso);
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  });

  const ingresosMes = esteMes.reduce((total, r) => total + Number(r.precio_total || 0), 0);
  const enAlquiler = vehiculos.filter(v => v.status === VEHICULO.EN_ALQUILER).length;
  const enMantenimiento = vehiculos.filter(v => v.status === VEHICULO.EN_MANTENIMIENTO).length;
  const ocupacion = vehiculos.length ? Math.round((enAlquiler / vehiculos.length) * 100) : 0;

  const kpis = [
    { label: `Ingresos de ${MESES[ahora.getMonth()].toLowerCase()}`, value: formatRD(ingresosMes), sub: `${esteMes.length} reserva(s) cobrada(s)` },
    { label: 'Alquileres cobrados', value: cobradas.length, sub: `${reservas.length} reservas en total` },
    { label: 'Ocupación de flota', value: `${ocupacion}%`, sub: `${enAlquiler} de ${vehiculos.length} en alquiler` },
    { label: 'En mantenimiento', value: enMantenimiento, sub: `${mantenimientos.length} orden(es) registradas` },
  ];

  // Ingresos de los últimos 6 meses, incluido el actual.
  const meses = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
    const total = cobradas.reduce((suma, r) => {
      const iso = toISODateFromApi(r.fecha_inicio);
      if (!iso) return suma;
      const d = fromISODate(iso);
      const mismoMes = d.getMonth() === fecha.getMonth() && d.getFullYear() === fecha.getFullYear();
      return mismoMes ? suma + Number(r.precio_total || 0) : suma;
    }, 0);
    return { label: MESES[fecha.getMonth()], total };
  });
  const maxMes = Math.max(...meses.map(m => m.total), 1);

  // Ranking por número de reservas cobradas.
  const porVehiculo = new Map();
  cobradas.forEach(r => {
    const key = r.vehicleId;
    if (!key) return;
    const actual = porVehiculo.get(key) || { nombre: r.vehicleName, viajes: 0, ingresos: 0 };
    actual.viajes += 1;
    actual.ingresos += Number(r.precio_total || 0);
    porVehiculo.set(key, actual);
  });
  const topVehiculos = [...porVehiculo.entries()]
    .map(([id, datos]) => ({ id, ...datos, estado: vehiculos.find(v => v.id === id)?.status }))
    .sort((a, b) => b.viajes - a.viajes)
    .slice(0, 5);

  const alertas = mantenimientos.filter(m => m.estado !== 'completado');
  const distribucion = [
    { label: 'En alquiler', value: enAlquiler, color: 'bg-blue-600' },
    { label: 'En mantenimiento', value: enMantenimiento, color: 'bg-violet-600' },
    { label: 'Disponible', value: vehiculos.filter(v => v.status === VEHICULO.DISPONIBLE).length, color: 'bg-slate-300' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 h-fit">
          {[
            { icon: BarChart3, label: 'Resumen', value: '' },
            { icon: Package, label: 'Vehículos', value: vehiculos.length },
            { icon: ClipboardList, label: 'Reservas', value: reservas.length },
            { icon: Wrench, label: 'Mantenimiento', value: mantenimientos.length },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  index === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center gap-3"><Icon className="w-4 h-4" />{item.label}</span>
                {item.value !== '' && <span className="text-xs text-slate-400">{item.value}</span>}
              </div>
            );
          })}
        </aside>

        <main>
          {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resumen de operación</h1>
            <p className="text-sm text-slate-500 mt-1 capitalize">
              {ahora.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })} · Santo Domingo
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {kpis.map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-xs text-slate-500">{k.label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{k.value}</div>
                <div className="text-xs mt-1 text-slate-400">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-4 mt-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="font-bold text-slate-900">Ingresos por mes</div>
              <div className="text-xs text-slate-500">últimos 6 meses · por fecha de inicio</div>
              {ingresosMes === 0 && meses.every(m => m.total === 0) ? (
                <div className="mt-6 text-sm text-slate-500">Todavía no hay reservas cobradas para graficar.</div>
              ) : (
                <div className="mt-6 flex items-end gap-3 h-44">
                  {meses.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end h-full">
                      <div className="text-[10px] text-slate-500 font-medium">{m.total ? formatRD(m.total) : ''}</div>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 min-h-[2px]"
                        style={{ height: `${(m.total / maxMes) * 100}%` }}
                      />
                      <div className="text-xs text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="font-bold text-slate-900">Estado de la flota</div>
              <div className="text-xs text-slate-500">{vehiculos.length} vehículo(s)</div>
              <div className="mt-5 space-y-3">
                {distribucion.map(d => {
                  const pct = vehiculos.length ? Math.round((d.value / vehiculos.length) * 100) : 0;
                  return (
                    <div key={d.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{d.label}</span>
                        <span className="font-semibold text-slate-900">{d.value} · {pct}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 mt-4">
            <div className="p-5 border-b border-slate-100 font-bold text-slate-900">Vehículos más alquilados</div>
            {topVehiculos.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Ninguna reserva cobrada todavía.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 font-semibold tracking-wider">
                    <th className="text-left px-5 py-3">VEHÍCULO</th>
                    <th className="text-left py-3">RESERVAS</th>
                    <th className="text-left py-3">INGRESOS</th>
                    <th className="text-left px-5 py-3">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topVehiculos.map(row => (
                    <tr key={row.id}>
                      <td className="px-5 py-3 font-semibold text-slate-900">{row.nombre}</td>
                      <td className="py-3 text-slate-700">{row.viajes}</td>
                      <td className="py-3 text-slate-700 font-mono">{formatRD(row.ingresos)}</td>
                      <td className="px-5 py-3">{row.estado ? <StatusBadge status={row.estado} size="sm" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 mt-4 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="font-bold text-slate-900">Mantenimientos abiertos</div>
              {alertas.length > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{alertas.length}</div>
              )}
            </div>
            {alertas.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">No hay mantenimientos programados ni en proceso.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {alertas.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-2 h-2 rounded-full ${m.estado === 'en_proceso' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">
                        {m.vehiculo?.nombre || `Vehículo #${m.vehiculo_id}`} · {m.tipo}
                      </div>
                      <div className="text-xs text-slate-500">
                        {m.descripcion || 'Sin descripción'} · programado {formatShortDate(m.fecha_programada)}
                        {m.costo && <> · {formatRD(Number(m.costo))}</>}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 capitalize">{(m.estado || '').replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
