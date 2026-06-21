import { useState } from 'react';
import { Bike, ClipboardCheck, Globe, Lock, Mail, ShieldCheck, Smartphone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const [role, setRole] = useState('cliente');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login(role);
    if (role === 'cliente') navigate('/catalogo');
    else if (role === 'operador') navigate('/operaciones');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10"><Logo dark /></div>
        <Bike className="absolute right-0 bottom-0 w-[480px] h-[480px] text-white/5" strokeWidth={1} />
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Miles de dominicanos<br />ya se mueven con MotoGo.
          </h2>
          <p className="text-blue-200 mt-3">Reserva en minutos. Paga seguro. Rueda tranquilo.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-xs text-emerald-600 font-bold tracking-wider">BIENVENIDO</div>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Inicia sesión</h1>

          <div className="mt-6 bg-slate-100 rounded-xl p-1 flex">
            <button className="flex-1 py-2 rounded-lg bg-white text-blue-600 text-sm font-semibold shadow-sm">Iniciar sesión</button>
            <button className="flex-1 py-2 text-slate-500 text-sm font-medium">Registrarse</button>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">Soy</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { id: 'cliente', label: 'Cliente', icon: User },
                { id: 'operador', label: 'Operador', icon: ClipboardCheck },
                { id: 'admin', label: 'Administrador', icon: ShieldCheck },
              ].map(r => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                      active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-500"
                defaultValue="juan@correo.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
                defaultValue="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Entrar
          </button>

          <div className="mt-5 text-xs text-slate-500 text-center">o continúa con</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button className="py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 flex items-center justify-center gap-2 bg-white">
              <Globe className="w-4 h-4" /> Google
            </button>
            <button className="py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 flex items-center justify-center gap-2 bg-white">
              <Smartphone className="w-4 h-4" /> Inicio rápido
            </button>
          </div>
          <div className="mt-5 text-sm text-center text-slate-500">
            ¿No tienes cuenta? <span className="text-blue-600 font-semibold cursor-pointer">Regístrate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
