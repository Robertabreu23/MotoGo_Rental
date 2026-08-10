import { useState } from 'react';
import { Bike, Lock, Mail, Phone, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

function MensajeError({ texto }) {
  // Un espacio significa "resalta el campo" sin repetir el mensaje del banner.
  if (!texto || texto.trim() === '') return null;
  return <p className="mt-1 text-xs text-red-600">{texto}</p>;
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', telefono: '', cedula: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    // Al corregir el campo desaparece su error, no al enviar de nuevo.
    setFieldErrors(current => (current[field] ? { ...current, [field]: null } : current));
  };

  const cambiarModo = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setFieldErrors({});
  };

  const validar = () => {
    const errores = {};

    if (!form.correo.trim()) errores.correo = 'Escribe tu correo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) errores.correo = 'Ese correo no tiene un formato válido.';

    if (!form.password) errores.password = 'Escribe tu contraseña.';
    else if (mode === 'register' && form.password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.';

    if (mode === 'register' && !form.nombre.trim()) errores.nombre = 'Escribe tu nombre.';

    return errores;
  };

  const bordeDe = (campo) =>
    fieldErrors[campo] ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-500';

  // El rol lo define el backend, no el usuario: aquí solo se decide a dónde aterriza.
  const navigateByRole = (nextRole) => {
    const from = location.state?.from?.pathname;
    if (from) navigate(from, { replace: true });
    else if (nextRole === 'operador') navigate('/operaciones', { replace: true });
    else if (nextRole === 'admin') navigate('/admin', { replace: true });
    else navigate('/catalogo', { replace: true });
  };

  const handleSubmit = async () => {
    const errores = validar();
    setFieldErrors(errores);

    if (Object.keys(errores).length > 0) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = mode === 'register'
        ? await register({ ...form, correo: form.correo.trim() })
        : await login({ correo: form.correo.trim(), password: form.password });
      navigateByRole(user?.rol || user?.role || 'cliente');
    } catch (err) {
      setError(err.message);
      // Un 401 en el login siempre es credencial mala: se resalta el par completo.
      if (err.status === 401) setFieldErrors({ correo: ' ', password: ' ' });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-slate-900 mt-2">{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>

          <div className="mt-6 bg-slate-100 rounded-xl p-1 flex">
            <button
              onClick={() => cambiarModo('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => cambiarModo('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Registrarse
            </button>
          </div>

          {mode === 'register' && (
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={form.nombre}
                  onChange={(event) => updateField('nombre', event.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none ${bordeDe('nombre')}`}
                />
              </div>
              <MensajeError texto={fieldErrors.nombre} />
            </div>
          )}

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.correo}
                onChange={(event) => updateField('correo', event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none ${bordeDe('correo')}`}
              />
            </div>
            <MensajeError texto={fieldErrors.correo} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white outline-none ${bordeDe('password')}`}
              />
            </div>
            <MensajeError texto={fieldErrors.password} />
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={form.telefono}
                    onChange={(event) => updateField('telefono', event.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cédula</label>
                <input
                  value={form.cedula}
                  onChange={(event) => updateField('cedula', event.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <div className="mt-5 text-sm text-center text-slate-500">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button onClick={() => cambiarModo(mode === 'login' ? 'register' : 'login')} className="text-blue-600 font-semibold cursor-pointer">
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
