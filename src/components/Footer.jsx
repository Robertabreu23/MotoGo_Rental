import Logo from './Logo.jsx';

export default function Footer() {
  const columns = [
    { t: 'PLATAFORMA', items: ['Catálogo', 'Cómo funciona', 'Precios', 'Puntos de recogida'] },
    { t: 'EMPRESA',    items: ['Sobre nosotros', 'Para operadores', 'Contacto', 'Términos'] },
    { t: 'SOPORTE',    items: ['Centro de ayuda', 'WhatsApp', '(809) 555-0142', 'hola@motogo.do'] },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <Logo dark />
          <p className="text-sm mt-3 text-slate-400">
            La forma más fácil de moverte por República Dominicana. Renta por hora o por día.
          </p>
        </div>
        {columns.map(col => (
          <div key={col.t}>
            <div className="text-white font-bold text-sm mb-3 tracking-wider">{col.t}</div>
            <div className="space-y-2 text-sm">{col.items.map(i => <div key={i}>{i}</div>)}</div>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-400">
        <div>© {new Date().getFullYear()} MotoGo · Santo Domingo, RD</div>
        <div>Pagos seguros con Azul · tPago · Stripe</div>
      </div>
    </footer>
  );
}
