import { Heart, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themes } from '../lib/themes.js';
import { formatRD } from '../lib/format.js';
import StatusBadge from './StatusBadge.jsx';
import VehicleIcon from './VehicleIcon.jsx';

export default function VehicleCard({ v, isFavorite = false, favoriteLoading = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const t = themes[v.theme] || themes.emerald;
  const isUnavailable = v.status !== 'Disponible';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col">
      <div className={`relative h-36 bg-gradient-to-br ${t.bg} flex items-center justify-center`}>
        <VehicleIcon type={v.type} theme={v.theme} />
        <div className="absolute top-3 left-3">
          <StatusBadge status={v.status} />
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite?.(v.id)}
          disabled={favoriteLoading}
          aria-label={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition disabled:opacity-60 ${isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900">{v.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          {v.location}
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-slate-700">{v.rating}</span>
          <span>· {v.trips} viajes · {v.type}</span>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-slate-900">{formatRD(v.price)}</span>
            <span className="text-sm text-slate-500"> / día</span>
          </div>
          {isUnavailable ? (
            <button disabled className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium">
              No disp.
            </button>
          ) : (
            <button
              onClick={() => navigate(`/vehiculo/${v.id}`)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
