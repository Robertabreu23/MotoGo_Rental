import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const screens = [
  { to: '/',              label: '01 Landing' },
  { to: '/login',         label: '02 Login' },
  { to: '/catalogo',      label: '03 Catálogo',     role: 'cliente' },
  { to: '/vehiculo/2',    label: '04 Detalle',      role: 'cliente' },
  { to: '/reserva',       label: '05 Reserva',      role: 'cliente' },
  { to: '/confirmacion',  label: '06 Confirmación', role: 'cliente' },
  { to: '/mis-reservas',  label: '07 Cliente',      role: 'cliente' },
  { to: '/operaciones',   label: '08 Operador',     role: 'operador' },
  { to: '/admin',         label: '09 Admin',        role: 'admin' },
];

export default function DemoNav() {
  const location = useLocation();
  const { setRole } = useAuth();

  const handleClick = (screen) => {
    // Auto-asigna rol cuando saltas a una pantalla protegida
    if (screen.role) setRole(screen.role);
    else if (screen.to === '/' || screen.to === '/login') setRole(null);
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-2 overflow-x-auto sticky top-0 z-20">
      <div className="text-xs font-bold tracking-wider text-emerald-400 whitespace-nowrap mr-2">DEMO</div>
      {screens.map(s => (
        <Link
          key={s.to + s.label}
          to={s.to}
          onClick={() => handleClick(s)}
          className={`text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap transition ${
            location.pathname === s.to
              ? 'bg-emerald-500 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
