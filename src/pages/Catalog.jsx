import { useEffect, useState } from 'react';
import { CalendarDays, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addFavorito, getFavoritos, getVehiculos, removeFavorito } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { addDays, formatShortDate, todayISO } from '../lib/dates.js';
import { VEHICULO } from '../lib/estados.js';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleFormDialog from '../components/VehicleFormDialog.jsx';

const typeTabs = {
  Todos: [],
  Motores: ['Motor'],
  Deportivos: ['Deportivo'],
  Bicicletas: ['Bicicleta'],
  Carros: ['Carro'],
};

export default function Catalog() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const isStaff = role === 'operador' || role === 'admin';
  const hoy = todayISO();
  const [creating, setCreating] = useState(false);
  const [orden, setOrden] = useState('recomendados');
  const [filter, setFilter] = useState('Todos');
  const [vehicles, setVehicles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
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

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }

    let active = true;

    getFavoritos()
      .then(data => {
        if (!active) return;
        const items = Array.isArray(data) ? data : [];
        setFavoriteIds(items.map(item => item.vehiculo_id ?? item.vehiculoId ?? item.id).filter(Boolean));
      })
      .catch(() => {
        if (active) setFavoriteIds([]);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleToggleFavorite = async (vehiculoId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteIds.includes(vehiculoId);
    setFavoriteLoadingId(vehiculoId);

    try {
      if (isFavorite) {
        await removeFavorito(vehiculoId);
        setFavoriteIds(current => current.filter(id => id !== vehiculoId));
      } else {
        await addFavorito(vehiculoId);
        setFavoriteIds(current => [...current, vehiculoId]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFavoriteLoadingId(null);
    }
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

  // El rango del slider sale de la flota real, no de valores fijos.
  const precios = vehicles.map(v => Number(v.price)).filter(Number.isFinite);
  const precioMin = precios.length ? Math.floor(Math.min(...precios)) : 0;
  const precioMax = precios.length ? Math.ceil(Math.max(...precios)) : 1;
  const precioTope = maxPrice === null ? precioMax : Number(maxPrice);

  const filtered = vehicles.filter(vehicle => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicle.type);
    const matchesPrice = Number(vehicle.price) <= precioTope;
    const matchesAvailability = !availableOnly || vehicle.status === VEHICULO.DISPONIBLE;
    return matchesType && matchesPrice && matchesAvailability;
  }).sort((a, b) => {
    if (orden === 'precio_asc') return a.price - b.price;
    if (orden === 'precio_desc') return b.price - a.price;
    return Number(b.rating || 0) - Number(a.rating || 0);
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
                min={precioMin}
                max={precioMax}
                step="10"
                value={precioTope}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>RD${precioMin.toLocaleString('en-US')}</span>
                <span>RD${precioTope.toLocaleString('en-US')}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Fechas sugeridas</div>
              <div className="space-y-2">
                <div className="border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">RECOGIDA</div>
                    <div className="text-sm font-semibold text-slate-900">{formatShortDate(hoy)}</div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">DEVOLUCIÓN</div>
                    <div className="text-sm font-semibold text-slate-900">{formatShortDate(addDays(hoy, 3))}</div>
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
                {filtered.length} vehículos en Santo Domingo · {formatShortDate(hoy)} – {formatShortDate(addDays(hoy, 3))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setCreating(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {isStaff ? 'Agregar vehículo' : 'Publicar el mío'}
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={orden}
                  onChange={(event) => setOrden(event.target.value)}
                  className="text-sm font-medium text-slate-700 bg-transparent outline-none"
                >
                  <option value="recomendados">Recomendados</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
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

      {creating && (
        <VehicleFormDialog
          onClose={() => setCreating(false)}
          onSaved={(nuevo) => {
            setVehicles(current => [nuevo, ...current]);
            navigate(`/vehiculo/${nuevo.id}`);
          }}
        />
      )}
    </div>
  );
}
