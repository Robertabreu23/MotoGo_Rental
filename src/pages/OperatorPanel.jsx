import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Trash2, Truck } from 'lucide-react';
import { finalizarReserva, getReservas, iniciarReserva } from '../api/services.js';
import { normalizeReservation } from '../api/mappers.js';
import { formatRD } from '../lib/format.js';
import { RESERVA } from '../lib/estados.js';
import { isStorageConfigured, uploadVehiclePhoto } from '../lib/supabase.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function OperatorPanel() {
  const [reservations, setReservations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ combustible_pct: 100, notas: '', danios_reportados: 0 });
  const [fotos, setFotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const fileInputRef = useRef(null);

  const cargarReservas = () => {
    setLoading(true);

    return getReservas()
      .then(data => {
        const lista = (Array.isArray(data) ? data : []).map(normalizeReservation);
        setReservations(lista);
        return lista;
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  // Solo estas dos requieren acción del operador: entregar o recibir.
  const pendientesDeAccion = reservations.filter(
    r => r.status === RESERVA.CONFIRMADA || r.status === RESERVA.EN_CURSO,
  );
  const selected = pendientesDeAccion.find(r => r.id === selectedId) || null;
  const esEntrega = selected?.status === RESERVA.CONFIRMADA;

  const seleccionar = (reserva) => {
    setSelectedId(reserva.id);
    setForm({ combustible_pct: 100, notas: '', danios_reportados: 0 });
    setFotos([]);
    setResultado(null);
    setError(null);
  };

  const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0 || !selected) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const url = await uploadVehiclePhoto(file, `reservas/${selected.id}`);
        setFotos(current => [...current, url]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;

    const combustible = Number(form.combustible_pct);
    if (combustible < 0 || combustible > 100) {
      setError('El combustible debe estar entre 0 y 100.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (esEntrega) {
        await iniciarReserva(selected.id, {
          fotos_urls: fotos,
          combustible_pct: combustible,
          notas: form.notas,
        });
        setResultado({ tipo: 'entrega' });
      } else {
        const data = await finalizarReserva(selected.id, {
          danios_reportados: Number(form.danios_reportados) || 0,
          notas: form.notas,
          fotos_urls: fotos,
          combustible_pct: combustible,
        });
        setResultado({ tipo: 'devolucion', reembolso: data?.reembolso });
      }

      const lista = await cargarReservas();
      // Tras entregar sigue el mismo id (ahora en curso); tras devolver ya no aplica.
      const sigue = lista?.find(r => r.id === selected.id && r.status === RESERVA.EN_CURSO);
      setSelectedId(sigue ? selected.id : null);
      setFotos([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-slate-50 min-h-screen p-8 text-sm text-slate-500">Cargando operación...</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-xs text-emerald-600 font-bold tracking-wider">PANEL DEL OPERADOR</div>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Entregas y devoluciones</h1>
        <p className="text-slate-500 mt-1">
          {pendientesDeAccion.length} reserva(s) esperando acción · {reservations.length} en total.
        </p>

        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {resultado && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {resultado.tipo === 'entrega' ? (
              'Vehículo entregado. La reserva pasó a "en curso".'
            ) : (
              <>
                Reserva cerrada. Reembolso del depósito: <strong>{formatRD(Number(resultado.reembolso?.monto || 0))}</strong>.
                {resultado.reembolso?.motivo_retencion && <div className="mt-1">{resultado.reembolso.motivo_retencion}</div>}
              </>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 mt-6">
          {/* Cola de trabajo */}
          <div className="bg-white rounded-2xl border border-slate-200 h-fit">
            <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-900">Cola de trabajo</div>
            <div className="divide-y divide-slate-100">
              {pendientesDeAccion.length === 0 && (
                <div className="p-5 text-sm text-slate-500">
                  No hay entregas ni devoluciones pendientes. Una reserva aparece aquí cuando el cliente
                  ya pagó (queda "confirmada").
                </div>
              )}
              {pendientesDeAccion.map(r => (
                <button
                  key={r.id}
                  onClick={() => seleccionar(r)}
                  className={`w-full text-left p-4 hover:bg-slate-50 ${selectedId === r.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900 text-sm">{r.vehicleName}</div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {r.dates}
                    {r.codigo && <> · <span className="font-mono">{r.codigo}</span></>}
                  </div>
                  {r.cliente && (
                    <div className="text-xs text-slate-700 mt-1 font-medium">{r.cliente.nombre}</div>
                  )}
                  <div className="text-xs font-medium text-blue-600 mt-1">
                    {r.status === RESERVA.CONFIRMADA ? 'Entregar vehículo' : 'Recibir devolución'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario */}
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Selecciona una reserva de la cola para registrar la entrega o la devolución.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                {esEntrega ? <Truck className="w-5 h-5 text-blue-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {esEntrega ? 'Entrega' : 'Devolución'} · {selected.vehicleName}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {selected.dates} · depósito {formatRD(Number(selected.deposito || 0))}
              </p>

              {selected.cliente && (
                <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <div className="text-xs text-slate-500">Cliente</div>
                  <div className="font-semibold text-slate-900">{selected.cliente.nombre}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {[selected.cliente.cedula && `Cédula ${selected.cliente.cedula}`, selected.cliente.telefono, selected.cliente.correo]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-700">
                  Fotos de {esEntrega ? 'entrega' : 'devolución'}
                </label>
                {fotos.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {fotos.map(url => (
                      <div key={url} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square">
                        <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFotos(current => current.filter(item => item !== url))}
                          aria-label="Quitar foto"
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
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
                      <Camera className="w-4 h-4" /> {uploading ? 'Subiendo...' : 'Tomar o subir fotos'}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Configura Supabase Storage para adjuntar evidencia.</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Combustible (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.combustible_pct}
                    onChange={(event) => updateField('combustible_pct', event.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
                {!esEntrega && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Daños reportados (RD$)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.danios_reportados}
                      onChange={(event) => updateField('danios_reportados', event.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700">Notas</label>
                <textarea
                  rows={2}
                  value={form.notas}
                  onChange={(event) => updateField('notas', event.target.value)}
                  placeholder={esEntrega ? 'Sin daños visibles al entregar.' : 'Rayón leve en el guardafango.'}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {!esEntrega && Number(form.danios_reportados) > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 text-xs text-amber-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Se retendrá {formatRD(Math.min(Number(form.danios_reportados), Number(selected.deposito || 0)))} del
                    depósito. El monto exacto lo calcula el backend al cerrar.
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? 'Guardando...' : esEntrega ? 'Confirmar entrega' : 'Cerrar reserva'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
