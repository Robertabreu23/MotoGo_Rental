import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { getVehicleById } from '../data/vehicles.js';
import { themes } from '../lib/themes.js';
import { formatRD } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import VehicleIcon from '../components/VehicleIcon.jsx';

export default function VehicleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const v = getVehicleById(id) || getVehicleById(2);
  const t = themes[v.theme];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-sm text-slate-500 mb-4">
          <Link to="/catalogo" className="cursor-pointer hover:text-blue-600">Catálogo</Link>
          {' '}/ {v.type} / <span className="text-slate-900 font-medium">{v.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div>
            <div className={`rounded-3xl bg-gradient-to-br ${t.bg} aspect-[16/10] flex items-center justify-center relative`}>
              <VehicleIcon type={v.type} theme={v.theme} className="w-48 h-48" />
              <div className="absolute top-4 left-4"><StatusBadge status={v.status} /></div>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h1 className="text-3xl font-bold text-slate-900">{v.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">{v.rating}</span> ({v.trips} viajes)
                </span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{v.location}</span>
              </div>
              <p className="text-slate-600 mt-4">
                {v.name} en excelente estado, ideal para moverte por la ciudad. Incluye casco,
                candado y seguro básico. Entrega y devolución en el punto de recogida indicado.
              </p>

              <div className="grid grid-cols-4 gap-4 mt-6">
                {[
                  ['Cilindrada', '155cc'],
                  ['Capacidad', '2 personas'],
                  ['Transmisión', 'Automática'],
                  ['Combustible', 'Gasolina'],
                ].map(([k, val]) => (
                  <div key={k} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="font-bold text-slate-900 mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900">Disponibilidad y punto de recogida</h3>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="font-semibold text-slate-700 text-sm mb-3">Junio 2026</div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div key={i} className="text-slate-400 font-semibold py-1">{d}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1;
                      const selected = day >= 9 && day <= 12;
                      const unavailable = [16, 17, 23].includes(day);
                      return (
                        <div
                          key={day}
                          className={`py-1.5 rounded ${
                            selected ? 'bg-blue-600 text-white font-bold'
                              : unavailable ? 'bg-slate-100 text-slate-400 line-through'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-600" /> Seleccionado
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-slate-100" /> No disponible
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl p-5 relative">
                  <MapPin className="w-8 h-8 text-emerald-600" />
                  <div className="mt-2 font-bold text-slate-900">{v.location}</div>
                  <div className="text-xs text-slate-600 mt-1">A 4 min en carro · Abre 8:00–20:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{formatRD(v.price)}</span>
                <span className="text-slate-500"> / día</span>
              </div>
              <div className="text-sm text-slate-500">o {formatRD(240)} / hora</div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="border border-slate-200 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-500 font-semibold">RECOGIDA</div>
                  <div className="text-sm font-semibold text-slate-900">9 jun</div>
                </div>
                <div className="border border-slate-200 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-500 font-semibold">DEVOLUCIÓN</div>
                  <div className="text-sm font-semibold text-slate-900">12 jun</div>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{formatRD(v.price)} × 3 días</span>
                  <span className="font-semibold text-slate-900">{formatRD(v.price * 3)}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-600">Tarifa de servicio</span><span className="font-semibold text-slate-900">RD$250</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Depósito de garantía</span><span className="font-semibold text-slate-900">RD$1,000</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatRD(v.price * 3 + 250 + 1000)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/reserva')}
                className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Reservar ahora
              </button>
              <div className="mt-3 text-xs text-slate-500 text-center">Sin cargos hasta que confirmes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
