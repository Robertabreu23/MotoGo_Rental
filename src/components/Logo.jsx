import { Bike } from 'lucide-react';

export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-9 h-9 rounded-xl ${dark ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-900 to-blue-800'} flex items-center justify-center`}>
        <Bike className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
      </div>
      <span className={`font-bold text-lg ${dark ? 'text-white' : 'text-slate-900'}`}>
        Moto<span className="text-emerald-500">Go</span>
      </span>
    </div>
  );
}
