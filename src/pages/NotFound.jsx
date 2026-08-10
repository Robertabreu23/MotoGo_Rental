import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mt-6">Esta página no existe</h1>
        <p className="text-slate-600 mt-2">Puede que el enlace esté roto o que la reserva ya no esté disponible.</p>
        <button
          onClick={() => navigate('/catalogo')}
          className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Ir al catálogo
        </button>
      </div>
    </div>
  );
}
