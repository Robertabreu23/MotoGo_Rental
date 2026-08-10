import { Ban, Check, Clock, CreditCard, Flag, Wrench } from 'lucide-react';
import { RESERVA_LABEL } from '../lib/estados.js';

const CONFIG = {
  // Vehículos
  'Disponible':       { textColor: 'text-emerald-700', dotBg: 'bg-emerald-100', dotIconColor: 'text-emerald-600', Icon: Check },
  'En alquiler':      { textColor: 'text-violet-700',  dotBg: 'bg-violet-100',  dotIconColor: 'text-violet-600',  Icon: Clock },
  'En mantenimiento': { textColor: 'text-amber-700',   dotBg: 'bg-amber-100',   dotIconColor: 'text-amber-600',   Icon: Wrench },
  // Reservas
  'pendiente':  { textColor: 'text-amber-700',   dotBg: 'bg-amber-100',   dotIconColor: 'text-amber-600',   Icon: CreditCard },
  'confirmada': { textColor: 'text-blue-700',    dotBg: 'bg-blue-100',    dotIconColor: 'text-blue-600',    Icon: Check },
  'en_curso':   { textColor: 'text-violet-700',  dotBg: 'bg-violet-100',  dotIconColor: 'text-violet-600',  Icon: Clock },
  'finalizada': { textColor: 'text-emerald-700', dotBg: 'bg-emerald-100', dotIconColor: 'text-emerald-600', Icon: Flag },
  'cancelada':  { textColor: 'text-slate-600',   dotBg: 'bg-slate-200',   dotIconColor: 'text-slate-500',   Icon: Ban },
};

const FALLBACK = { textColor: 'text-slate-600', dotBg: 'bg-slate-200', dotIconColor: 'text-slate-500', Icon: Check };

export default function StatusBadge({ status, size = 'md' }) {
  const config = CONFIG[status] || FALLBACK;
  const Icon = config.Icon;
  const padding = size === 'sm' ? 'pl-1 pr-2.5 py-0.5' : 'pl-1.5 pr-3 py-1';

  return (
    <div className={`inline-flex items-center gap-2 ${padding} text-xs rounded-full bg-white ${config.textColor} font-semibold shadow-sm border border-slate-100 whitespace-nowrap`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${config.dotBg}`}>
        <Icon className={`w-3 h-3 ${config.dotIconColor}`} strokeWidth={3} />
      </span>
      {RESERVA_LABEL[status] || status}
    </div>
  );
}
