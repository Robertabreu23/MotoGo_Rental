import { Bike, CheckCircle2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themes } from '../lib/themes.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Confirmation() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-6">¡Listo! Tu reserva está confirmada</h1>
          <p className="text-slate-600 mt-2">
            Te enviamos los detalles por WhatsApp. Preséntate en el punto de recogida con tu cédula y licencia.
          </p>

          <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-slate-500 font-semibold tracking-wider">CÓDIGO</div>
              <div className="font-mono font-bold text-slate-900">RES-8K42Q</div>
            </div>
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${themes.violet.bg} flex items-center justify-center`}>
                  <Bike className="w-8 h-8 text-violet-400 opacity-60" strokeWidth={1.2} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Yamaha NMAX 155</div>
                  <div className="text-sm text-slate-500">Naco, Santo Domingo</div>
                </div>
              </div>
              <StatusBadge status="En alquiler" />
            </div>
            <div className="mt-5 space-y-2 text-sm border-t border-slate-200 pt-4">
              <div className="flex justify-between"><span className="text-slate-600">Periodo</span><span className="font-semibold text-slate-900">9 jun, 9:00 → 12 jun, 18:00</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Total pagado</span><span className="font-semibold text-slate-900">RD$5,200</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Depósito (reembolsable)</span><span className="font-semibold text-slate-900">RD$1,000</span></div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 bg-white">
              <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
            </button>
            <button
              onClick={() => navigate('/mis-reservas')}
              className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              Ver mis reservas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
