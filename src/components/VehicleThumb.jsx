import { useState } from 'react';
import { themes } from '../lib/themes.js';
import VehicleIcon from './VehicleIcon.jsx';

/** Foto del vehículo con el ícono como respaldo si no hay o si la URL falla. */
export default function VehicleThumb({ vehicle, className = '', iconClassName = 'w-20 h-20' }) {
  const [failed, setFailed] = useState(false);
  const theme = vehicle?.theme || 'emerald';
  const t = themes[theme] || themes.emerald;
  const photo = !failed ? vehicle?.photos?.[0] : null;

  return (
    <div className={`bg-gradient-to-br ${t.bg} flex items-center justify-center overflow-hidden ${className}`}>
      {photo ? (
        <img
          src={photo}
          alt={vehicle?.name || 'Vehículo'}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <VehicleIcon type={vehicle?.type} theme={theme} className={iconClassName} />
      )}
    </div>
  );
}
