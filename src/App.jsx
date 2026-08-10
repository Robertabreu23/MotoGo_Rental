import { Routes, Route, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Catalog from './pages/Catalog.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Booking from './pages/Booking.jsx';
import Confirmation from './pages/Confirmation.jsx';
import ClientPanel from './pages/ClientPanel.jsx';
import MyVehicles from './pages/MyVehicles.jsx';
import OperatorPanel from './pages/OperatorPanel.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  const hideTopNav = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white">
      {!hideTopNav && <TopNav />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />

        <Route path="/reserva" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/confirmacion" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
        <Route path="/mis-reservas" element={<ProtectedRoute><ClientPanel /></ProtectedRoute>} />
        <Route path="/mis-vehiculos" element={<ProtectedRoute><MyVehicles /></ProtectedRoute>} />

        <Route
          path="/operaciones"
          element={
            <ProtectedRoute roles={['operador', 'admin']}>
              <OperatorPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
