import { useEffect, useState } from 'react';
import { ArrowRight, Bike, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getVehiculos } from '../api/services.js';
import { normalizeVehicle } from '../api/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { addDays, formatShortDate, todayISO } from '../lib/dates.js';
import { VEHICULO } from '../lib/estados.js';
import { formatRD } from '../lib/format.js';
import VehicleCard from '../components/VehicleCard.jsx';
import Footer from '../components/Footer.jsx';

const ROTACION_MS = 4000;

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hoy = todayISO();
  const [vehicles, setVehicles] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [failedPhotoIds, setFailedPhotoIds] = useState([]);

  useEffect(() => {
    let active = true;

    getVehiculos()
      .then(data => {
        if (!active) return;
        setVehicles((Array.isArray(data) ? data : []).map(normalizeVehicle));
      })
      .catch(() => {
        if (active) setVehicles([]);
      })
      .finally(() => {
        if (active) setLoadingFeatured(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = vehicles.filter(v => v.status === VEHICULO.DISPONIBLE).slice(0, 4);
  const stats = {
    total: vehicles.length,
    ubicaciones: new Set(vehicles.map(v => v.location).filter(Boolean)).size,
    rating: vehicles.length
      ? (vehicles.reduce((sum, v) => sum + Number(v.rating || 0), 0) / vehicles.length).toFixed(1)
      : '—',
  };

  useEffect(() => {
    if (featured.length < 2) return;

    const timer = setInterval(() => {
      setHeroIndex(current => (current + 1) % featured.length);
    }, ROTACION_MS);

    return () => clearInterval(timer);
  }, [featured.length]);

  const hero = featured[heroIndex];
  const heroPhoto = hero && !failedPhotoIds.includes(hero.id) ? hero.photos?.[0] : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              ALQUILER DE MOTORES · 🇩🇴 RD
            </div>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              Tu próximo<br />trayecto, sin<br />complicaciones.
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Renta motores, scooters y bicicletas por hora o por día.<br />
              Recoge donde quieras y paga seguro con Azul o tPago.
            </p>

            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-3 grid grid-cols-4 gap-2">
              <div className="px-3 py-2">
                <div className="text-xs text-slate-500 font-semibold">UBICACIÓN</div>
                <div className="font-semibold text-slate-900 mt-1 text-sm">Santo Domingo</div>
              </div>
              <div className="px-3 py-2 border-l border-slate-100">
                <div className="text-xs text-slate-500 font-semibold">RECOGIDA</div>
                <div className="font-semibold text-slate-900 mt-1 text-sm">{formatShortDate(hoy)} · 9:00</div>
              </div>
              <div className="px-3 py-2 border-l border-slate-100">
                <div className="text-xs text-slate-500 font-semibold">DEVOLUCIÓN</div>
                <div className="font-semibold text-slate-900 mt-1 text-sm">{formatShortDate(addDays(hoy, 3))} · 18:00</div>
              </div>
              <button
                onClick={() => navigate('/catalogo')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>

            <div className="mt-8 flex gap-10">
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-500">vehículo(s) en flota</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.ubicaciones}</div>
                <div className="text-sm text-slate-500">punto(s) de recogida</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.rating} ★</div>
                <div className="text-sm text-slate-500">valoración media</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => hero && navigate(`/vehiculo/${hero.id}`)}
            disabled={!hero}
            className="group bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl aspect-square flex items-center justify-center relative overflow-hidden w-full text-left"
          >
            <Bike className="w-72 h-72 text-white/15" strokeWidth={1} />

            {/* Todas montadas a la vez: el cambio es un crossfade, no un salto. */}
            {featured.map((item, index) => {
              const url = item.photos?.[0];
              if (!url || failedPhotoIds.includes(item.id)) return null;
              const active = index === heroIndex;

              return (
                <img
                  key={item.id}
                  src={url}
                  alt={item.name}
                  onError={() => setFailedPhotoIds(current => [...current, item.id])}
                  className={`hero-photo absolute inset-0 w-full h-full object-cover ${
                    active ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                  }`}
                />
              );
            })}

            <div
              className={`absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent transition-opacity duration-700 ${
                heroPhoto ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              key={hero?.id}
              className="hero-caption absolute bottom-6 left-6 bg-white/10 backdrop-blur rounded-2xl px-4 py-3 text-white group-hover:bg-white/20 transition-colors"
            >
              <div className="text-xs opacity-70">DISPONIBLE AHORA</div>
              <div className="font-bold text-lg">{hero?.name || 'Cargando flota...'}</div>
              <div className="text-sm opacity-80">
                {hero ? `desde ${formatRD(hero.price)} / día` : 'Un momento'}
              </div>
            </div>

            {featured.length > 1 && (
              <div className="absolute bottom-8 right-6 flex gap-1.5">
                {featured.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 rounded-full bg-white transition-all duration-500 ${
                      index === heroIndex ? 'w-5 opacity-100' : 'w-1.5 opacity-40'
                    }`}
                  />
                ))}
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-xs text-emerald-600 font-bold tracking-wider">CÓMO FUNCIONA</div>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Renta en tres pasos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Busca y compara', d: 'Filtra por tipo, precio y fecha. Mira disponibilidad en tiempo real.' },
              { n: '02', t: 'Reserva y paga', d: 'Elige tu periodo, paga con Azul o tPago. Sin cargos hasta confirmar.' },
              { n: '03', t: 'Recoge y rueda', d: 'Pasa por el punto de recogida, verifica el estado y arranca.' },
            ].map(step => (
              <div key={step.n} className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="text-4xl font-bold text-blue-600">{step.n}</div>
                <h3 className="font-bold text-slate-900 mt-2 text-lg">{step.t}</h3>
                <p className="text-sm text-slate-600 mt-2">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehículos destacados */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs text-emerald-600 font-bold tracking-wider">VEHÍCULOS DESTACADOS</div>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Los más alquilados esta semana</h2>
            </div>
            <button
              onClick={() => navigate('/catalogo')}
              className="px-4 py-2 rounded-xl border border-blue-600 text-blue-600 font-medium text-sm flex items-center gap-2 hover:bg-blue-50"
            >
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loadingFeatured ? (
            <div className="text-sm text-slate-500">Cargando vehículos...</div>
          ) : featured.length === 0 ? (
            <div className="text-sm text-slate-500">No hay vehículos disponibles en este momento.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(v => <VehicleCard key={v.id} v={v} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA: solo tiene sentido para quien todavía no tiene cuenta */}
      {!isAuthenticated && (
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white">¿Listo para rodar?</h2>
              <p className="text-blue-100 mt-2">
                Crea tu cuenta gratis y reserva tu primer motor hoy.<br />
                Como cliente, operador o administrador de flota.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              <User className="w-5 h-5" /> Crear cuenta gratis
            </button>
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
