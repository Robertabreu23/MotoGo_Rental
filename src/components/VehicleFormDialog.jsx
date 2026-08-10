import { useRef, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { createVehiculo, updateVehiculo } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { isStorageConfigured, removeVehiclePhoto, uploadVehiclePhoto } from '../lib/supabase.js';

const TIPOS = ['Motor', 'Bicicleta', 'Deportivo', 'Carro'];
// "En alquiler" lo pone el ciclo de reservas al entregar, no el dueño a mano.
const ESTADOS_STAFF = ['Disponible', 'En alquiler', 'En mantenimiento'];
const ESTADOS_DUENO = ['Disponible', 'En mantenimiento'];

/** Sin `vehicle` crea uno nuevo; con `vehicle` edita el existente. */
export default function VehicleFormDialog({ vehicle, onClose, onSaved }) {
  const { role } = useAuth();
  const isStaff = role === 'operador' || role === 'admin';
  const estados = isStaff ? ESTADOS_STAFF : ESTADOS_DUENO;
  const isCreate = !vehicle?.id;
  const [form, setForm] = useState({
    nombre: vehicle?.name || '',
    tipo: vehicle?.type || 'Motor',
    precio_dia: vehicle?.price || '',
    ubicacion: vehicle?.location || '',
    descripcion: vehicle?.description || '',
    estado: vehicle?.status || 'Disponible',
  });
  const [fotos, setFotos] = useState(vehicle?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  // Un vehículo nuevo todavía no tiene id: las fotos van a una carpeta temporal.
  const [uploadFolder] = useState(() => vehicle?.id || `nuevos/${Date.now()}`);

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Secuencial a propósito: si una falla, las anteriores ya quedaron guardadas.
      for (const file of files) {
        const url = await uploadVehiclePhoto(file, uploadFolder);
        setFotos(current => [...current, url]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (url) => {
    setFotos(current => current.filter(item => item !== url));
    // Si el borrado en Storage falla, la foto ya salió del vehículo igual.
    removeVehiclePhoto(url).catch(() => {});
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.ubicacion.trim()) {
      setError('El nombre y la ubicación son obligatorios.');
      return;
    }

    if (!Number(form.precio_dia) || Number(form.precio_dia) <= 0) {
      setError('El precio por día debe ser mayor que cero.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // El backend solo acepta esta whitelist; propietario_id sale del token.
      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        precio_dia: Number(form.precio_dia),
        ubicacion: form.ubicacion.trim(),
        descripcion: form.descripcion,
        fotos,
      };

      // 'estado' no se acepta al crear: el backend lo pone en 'Disponible'.
      const saved = isCreate
        ? await createVehiculo(payload)
        : await updateVehiculo(vehicle.id, { ...payload, estado: form.estado });

      onSaved(normalizeVehicle(saved));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">{isCreate ? 'Agregar vehículo' : 'Editar vehículo'}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <input
              value={form.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={(event) => updateField('tipo', event.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
              >
                {TIPOS.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Precio por día (RD$)</label>
              <input
                type="number"
                min="0"
                value={form.precio_dia}
                onChange={(event) => updateField('precio_dia', event.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Ubicación</label>
            <input
              value={form.ubicacion}
              onChange={(event) => updateField('ubicacion', event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
            />
          </div>

          {!isCreate && (
            <div>
              <label className="text-sm font-medium text-slate-700">Estado</label>
              <select
                value={form.estado}
                onChange={(event) => updateField('estado', event.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
              >
                {estados.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                {/* Si ya está en alquiler, se conserva la opción para no perderla al guardar. */}
                {!estados.includes(form.estado) && <option value={form.estado}>{form.estado}</option>}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                "En mantenimiento" saca el vehículo del catálogo: deja de poder reservarse.
                {!isStaff && ' "En alquiler" lo gestiona el operador al entregar.'}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(event) => updateField('descripcion', event.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Fotos</label>

            {fotos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {fotos.map(url => (
                  <div key={url} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
                    <img src={url} alt="Foto del vehículo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      aria-label="Quitar foto"
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-sm hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isStorageConfigured ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploading ? 'Subiendo...' : 'Agregar fotos'}
                </button>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG o WEBP · máximo 5 MB cada una.</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 mt-2">
                Para subir fotos falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
              </p>
            )}
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Guardando...' : isCreate ? 'Crear vehículo' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
