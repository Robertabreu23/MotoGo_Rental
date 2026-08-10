import { useEffect, useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { getVehiculos } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import VehicleCard from '../components/VehicleCard.jsx';

const typeTabs = {
  Todos: [],
  Motores: ['Motor'],
  Deportivos: ['Deportivo'],
  Bicicletas: ['Bicicleta'],
  Carros: ['Carro'],
};

export default function Catalog() {
  const [filter, setFilter] = useState('Todos');
  const [vehicles, setVehicles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(2400);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getVehiculos()
      .then(data => setVehicles((Array.isArray(data) ? data : []).map(normalizeVehicle)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = (vehiculoId) => {
    setFavoriteLoadingId(vehiculoId);
    setFavoriteIds(current => current.includes(vehiculoId) ? current.filter(id => id !== vehiculoId) : [...current, vehiculoId]);
    setFavoriteLoadingId(null);
  };

  const toggleType = (type) => {
    setFilter('Todos');
    setSelectedTypes(current => current.includes(type) ? current.filter(t => t !== type) : [...current, type]);
  };

  const handleTabFilter = (tab) => {
    setFilter(tab);
    setSelectedTypes(typeTabs[tab]);
  };

  const typeCounts = vehicles.reduce((counts, vehicle) => ({
    ...counts,
    [vehicle.type]: (counts[vehicle.type] || 0) + 1,
  }), {});

  const filtered = vehicles.filter(vehicle => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicle.type);
    const matchesPrice = Number(vehicle.price) <= Number(maxPrice);
    const matchesAvailability = !availableOnly || vehicle.status === 'Disponible';
    return matchesType && matchesPrice && matchesAvailability;
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
                {['Motor', 'Bicicleta', 'Deportivo', 'Carro'].map(t => (
                  <label key={t} className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() => toggleType(t)}
                        className="rounded border-slate-300"
                      />
                      {t}
                    </span>
                    <span className="text-slate-400 text-xs">{typeCounts[t] || 0}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Precio por día</div>
              <input
                type="range"
                min="420"
                max="2400"
                step="10"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>RD$420</span><span>RD${Number(maxPrice).toLocaleString('en-US')}</span>
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
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(event) => setAvailableOnly(event.target.checked)}
                  className="rounded border-slate-300"
                /> Solo disponibles ahora
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
                onClick={() => handleTabFilter(t)}
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

          {loading && <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500">Cargando vehículos...</div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-sm text-red-700">{error}</div>}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(v => (
                <VehicleCard
                  key={v.id}
                  v={v}
                  isFavorite={favoriteIds.includes(v.id)}
                  favoriteLoading={favoriteLoadingId === v.id}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
