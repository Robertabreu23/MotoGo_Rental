import { Routes, Route, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav.jsx';
import DemoNav from './components/DemoNav.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Catalog from './pages/Catalog.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Booking from './pages/Booking.jsx';
import Confirmation from './pages/Confirmation.jsx';
import ClientPanel from './pages/ClientPanel.jsx';
import OperatorPanel from './pages/OperatorPanel.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const location = useLocation();
  const hideTopNav = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white">
      <DemoNav />
      {!hideTopNav && <TopNav />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/reserva" element={<Booking />} />
        <Route path="/confirmacion" element={<Confirmation />} />
        <Route path="/mis-reservas" element={<ClientPanel />} />
        <Route path="/operaciones" element={<OperatorPanel />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
