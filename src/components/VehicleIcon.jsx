import { Bike, Car } from 'lucide-react';
import { themes } from '../lib/themes.js';

export default function VehicleIcon({ type, className = 'w-20 h-20', theme = 'emerald' }) {
  const t = themes[theme];
  const cls = `${className} ${t.icon} opacity-60`;
  if (type === 'Carro') return <Car className={cls} strokeWidth={1.2} />;
  return <Bike className={cls} strokeWidth={1.2} />;
}
