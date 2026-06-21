import { AlertTriangle, BarChart3, ClipboardList, Package, Settings, TrendingUp, Users, Wrench } from 'lucide-react';
import { formatRD } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminDashboard() {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const revenue = [780, 850, 950, 1020, 1120, 1320];
  const max = 1400;

  const sidebarItems = [
    { icon: BarChart3,      label: 'Resumen', active: true },
    { icon: Package,        label: 'Inventario' },
    { icon: ClipboardList,  label: 'Reservas' },
    { icon: Users,          label: 'Operadores' },
    { icon: Wrench,         label: 'Mantenimiento' },
    { icon: Settings,       label: 'Ajustes' },
  ];

  const kpis = [
    { label: 'Ingresos del mes',  value: 'RD$1.32M', delta: '+18%',   sub: 'vs mayo' },
    { label: 'Alquileres',        value: '486',      delta: '+12%',   sub: 'vs mayo' },
    { label: 'Ocupación de flota',value: '78%',      delta: '+6 pts', sub: 'vs mayo' },
    { label: 'En mantenimiento',  value: '4',        delta: '-2',     sub: 'vs mayo' },
  ];

  const topVehicles = [
    ['Honda PCX 160',    211, 401900, 'Disponible'],
    ['Honda Cargo 150',  176, 193600, 'Disponible'],
    ['Honda Navi 110',   142, 120700, 'Disponible'],
    ['Kawasaki KLR 650', 121, 290400, 'En mantenimiento'],
  ];

  const alerts = [
    ['Kawasaki KLR 650 · revisión vencida', 'Cambio de aceite atrasado 9 días', 'red'],
    ['Honda PCX 160 · frenos',              'Programar revisión esta semana',   'amber'],
    ['Yamaha BWS 125 · neumáticos',         'Desgaste al 70%',                  'amber'],
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 h-fit">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />{item.label}
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <main>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Resumen de operación</h1>
              <p className="text-sm text-slate-500 mt-1">1–30 junio 2026 · Santo Domingo</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-medium bg-white">Junio 2026</button>
              <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium">Exportar</button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {kpis.map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-xs text-slate-500">{k.label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{k.value}</div>
                <div className="text-xs mt-1 flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />{k.delta} <span className="text-slate-400">{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-4 mt-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Ingresos por mes</div>
                  <div className="text-xs text-slate-500">en miles de RD$</div>
                </div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />+18% YTD
                </div>
              </div>
              <div className="mt-6 flex items-end gap-3 h-44">
                {revenue.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${(val / max) * 100}%` }} />
                    <div className="text-xs text-slate-500">{months[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
              <div className="font-bold text-slate-900">Ocupación</div>
              <div className="text-xs text-slate-500">78% ocupada</div>
              <div className="mt-5 flex items-center justify-center relative">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeDasharray="16 100" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeDasharray="72 100" strokeDashoffset="-16" />
                </svg>
                <div className="absolute text-center"><div className="text-2xl font-bold text-slate-900">78%</div></div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600" />En alquiler</span><span className="font-semibold">72%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-violet-600" />Reservada</span><span className="font-semibold">16%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" />Disponible</span><span className="font-semibold">12%</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 mt-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="font-bold text-slate-900">Equipos más alquilados</div>
              <button className="text-sm text-blue-600 font-medium">Ver todos</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 font-semibold tracking-wider">
                  <th className="text-left px-5 py-3">VEHÍCULO</th>
                  <th className="text-left py-3">VIAJES</th>
                  <th className="text-left py-3">INGRESOS</th>
                  <th className="text-left px-5 py-3">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topVehicles.map(row => (
                  <tr key={row[0]}>
                    <td className="px-5 py-3 font-semibold text-slate-900">{row[0]}</td>
                    <td className="py-3 text-slate-700">{row[1]}</td>
                    <td className="py-3 text-slate-700 font-mono">{formatRD(row[2])}</td>
                    <td className="px-5 py-3"><StatusBadge status={row[3]} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 mt-4 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="font-bold text-slate-900">Alertas de mantenimiento</div>
              <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">4</div>
            </div>
            <div className="mt-4 space-y-2">
              {alerts.map(([title, desc, color]) => (
                <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className={`w-2 h-2 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <button className="text-xs text-blue-600 font-semibold">Programar</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
