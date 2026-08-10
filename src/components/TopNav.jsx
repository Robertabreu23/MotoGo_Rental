import { useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function TopNav() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = !role ? [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/', label: 'Cómo funciona' },
  ] : role === 'cliente' ? [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/mis-reservas', label: 'Mis reservas' },
    { to: '/mis-vehiculos', label: 'Mis vehículos' },
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

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

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
            <div className="relative">
              <button
                onClick={() => setMenuOpen(open => !open)}
                className="flex items-center gap-2"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {roleLabel}
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">
                  {user?.initials || 'US'}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 truncate">{user?.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/mis-reservas"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Mis reservas
                    </Link>
                    <Link
                      to="/mis-vehiculos"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Mis vehículos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
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
