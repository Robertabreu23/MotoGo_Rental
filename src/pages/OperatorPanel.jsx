import { AlertTriangle, ArrowLeft, ArrowRight, Camera, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorPanel() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-xs text-emerald-600 font-bold tracking-wider">PANEL DEL OPERADOR</div>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Devolución · Honda PCX 160</h1>
        <p className="text-slate-500 mt-1">
          Reserva <span className="font-mono">RES-8K42Q</span> · Cliente: Juan Martínez · Punto: Bella Vista, SD
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900">Evidencia fotográfica</h3>
            <p className="text-sm text-slate-500 mt-1">Compara el estado inicial (entrega) con el final (devolución).</p>

            <div className="grid grid-cols-2 gap-6 mt-5">
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <ArrowLeft className="w-4 h-4 text-blue-600" /> Estado inicial — entrega
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Frontal', 'Lateral'].map(label => (
                    <div key={label} className="aspect-square bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl flex items-center justify-center flex-col gap-1">
                      <ImageIcon className="w-8 h-8 text-emerald-400/60" />
                      <span className="text-xs text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <ArrowRight className="w-4 h-4 text-emerald-600" /> Estado final — devolución
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center flex-col gap-1">
                    <ImageIcon className="w-8 h-8 text-violet-400/60" />
                    <span className="text-xs text-slate-600">Frontal</span>
                  </div>
                  <button className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center flex-col gap-1 hover:border-blue-500 hover:bg-blue-50">
                    <Camera className="w-8 h-8 text-slate-400" />
                    <span className="text-xs text-slate-500">Subir foto</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">Notas de devolución</label>
              <textarea
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-blue-500"
                rows={2}
                defaultValue="Rayón leve en el guardabarros trasero. Combustible al 90%. Casco y candado devueltos."
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
            <h3 className="font-bold text-slate-900">Cierre de reserva</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Combustible</span><span className="font-semibold text-slate-900">90%</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Daños reportados</span><span className="font-semibold text-amber-600">Menores</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Depósito</span><span className="font-semibold text-slate-900">RD$1,000</span></div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">A reembolsar</span>
                <span className="font-bold text-emerald-600">RD$850</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-amber-50 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Se retiene RD$150 por el rayón reportado.</span>
            </div>
            <button
              onClick={() => navigate('/mis-reservas')}
              className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Cerrar reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
