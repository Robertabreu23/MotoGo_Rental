import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getVehiculos } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRD } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import VehicleThumb from '../components/VehicleThumb.jsx';
import VehicleFormDialog from '../components/VehicleFormDialog.jsx';

export default function MyVehicles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // La API no filtra por propietario, así que se filtra aquí.
    getVehiculos()
      .then(data => setVehicles((Array.isArray(data) ? data : []).map(normalizeVehicle)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mios = vehicles.filter(v => user?.id && v.propietario_id === user.id);
  const ingresoPotencial = mios.reduce((total, v) => total + Number(v.price || 0), 0);

  const aplicarCambio = (actualizado) => {
    setVehicles(current => {
      const existe = current.some(v => v.id === actualizado.id);
      return existe
        ? current.map(v => (v.id === actualizado.id ? actualizado : v))
        : [actualizado, ...current];
    });
  };

  if (loading) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Cargando tus vehículos...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-emerald-600 font-bold tracking-wider">MIS VEHÍCULOS</div>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Tu flota</h1>
            <p className="text-slate-500 mt-1">
              {mios.length === 0
                ? 'Todavía no has publicado ningún vehículo.'
                : `${mios.length} vehículo(s) publicado(s) · ${formatRD(ingresoPotencial)} por día si se alquilan todos.`}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Publicar vehículo
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {mios.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-600">
                Publica tu moto, bicicleta o carro y aparecerá en el catálogo para que otros lo reserven.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Tú decides el precio por día y puedes pausarlo cuando quieras.
              </p>
            </div>
          ) : (
            mios.map(v => (
              <div key={v.id} className="p-5 flex flex-wrap items-center gap-4">
                <VehicleThumb vehicle={v} className="w-20 h-16 rounded-xl shrink-0" iconClassName="w-8 h-8" />
                <div className="flex-1 min-w-[180px]">
                  <div className="font-bold text-slate-900">{v.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {v.type} · {v.location} · {formatRD(v.price)} / día
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {v.photos?.length ? `${v.photos.length} foto(s)` : 'Sin fotos'}
                  </div>
                </div>
                <StatusBadge status={v.status} size="sm" />
                <button
                  onClick={() => setEditing(v)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => navigate(`/vehiculo/${v.id}`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver ficha
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {(creating || editing) && (
        <VehicleFormDialog
          vehicle={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={aplicarCambio}
        />
      )}
    </div>
  );
}
