import { Bell, ChevronDown, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function TopNav() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const navItems = !role ? [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/', label: 'Cómo funciona' },
    { to: '/', label: 'Para operadores' },
  ] : role === 'cliente' ? [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/mis-reservas', label: 'Mis reservas' },
    { to: '/', label: 'Cómo funciona' },
  ] : role === 'operador' ? [
    { to: '/operaciones', label: 'Entregas' },
    { to: '/catalogo', label: 'Flota' },
    { to: '/mis-reservas', label: 'Historial' },
  ] : [
    { to: '/admin', label: 'Dashboard' },
    { to: '/catalogo', label: 'Inventario' },
    { to: '/operaciones', label: 'Operaciones' },
  ];

  const roleLabel = role === 'cliente' ? 'Cliente' : role === 'operador' ? 'Operador' : 'Administrador';

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, i) => (
              <Link key={i} to={item.to} className="text-sm font-medium text-slate-700 hover:text-blue-600">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {role ? (
            <>
              <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {roleLabel}
                <ChevronDown className="w-3 h-3" />
              </div>
              <button className="relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">
                {user?.initials || 'JM'}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-700">
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Crear cuenta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
