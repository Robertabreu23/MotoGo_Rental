import { useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { VEHICLES } from '../data/vehicles.js';
import VehicleCard from '../components/VehicleCard.jsx';

export default function Catalog() {
  const [filter, setFilter] = useState('Todos');

  const filtered = filter === 'Todos'
    ? VEHICLES
    : VEHICLES.filter(v => {
        if (filter === 'Motores')    return v.type === 'Motor';
        if (filter === 'Deportivos') return v.type === 'Deportivo';
        if (filter === 'Bicicletas') return v.type === 'Bicicleta';
        if (filter === 'Carros')     return v.type === 'Carro';
        return true;
      });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
          <h3 className="font-bold text-slate-900 mb-4">Filtros</h3>
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Tipo de vehículo</div>
              <div className="space-y-2">
                {[['Motor', 3], ['Bicicleta', 2], ['Deportivo', 4], ['Carro', 2]].map(([t, n]) => (
                  <label key={t} className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-slate-300" />
                      {t}
                    </span>
                    <span className="text-slate-400 text-xs">{n}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Precio por día</div>
              <div className="h-1.5 bg-slate-200 rounded-full relative">
                <div className="absolute h-1.5 bg-blue-600 rounded-full" style={{ left: '0%', right: '30%' }} />
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -top-0.5" style={{ left: '0%' }} />
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -top-0.5" style={{ right: '30%' }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>RD$420</span><span>RD$2,400</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Fechas</div>
              <div className="space-y-2">
                <div className="border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">RECOGIDA</div>
                    <div className="text-sm font-semibold text-slate-900">9 jun</div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">DEVOLUCIÓN</div>
                    <div className="text-sm font-semibold text-slate-900">12 jun</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Disponibilidad</div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" /> Solo disponibles ahora
              </label>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Catálogo de equipos</h1>
              <p className="text-sm text-slate-500 mt-1">
                {filtered.length} vehículos en Santo Domingo · 9–12 jun
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Recomendados
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['Todos', 'Motores', 'Deportivos', 'Bicicletas', 'Carros'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  filter === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
