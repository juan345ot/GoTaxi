import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import DriversList from "./components/Drivers/DriversList";
import PassengersList from "./components/Passengers/PassengersList";
import RatesManagement from "./components/Rates/RatesManagement";
import ComplaintsManagement from "./components/Complaints/ComplaintsManagement";
import Metrics from "./components/Dashboard/Metrics";
import SupportChat from "./components/Dashboard/SupportChat";

// Puedes crear este componente para error 404 custom
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl font-bold text-blue-600 mb-3">404</div>
        <div className="text-xl font-semibold mb-2">Página no encontrada</div>
        <a href="/" className="text-blue-700 underline">Ir al inicio</a>
      </div>
    </div>
  );
}

/**
 * En el futuro podés agregar protección por roles:
 *   if (!admin || !admin.roles.includes('superadmin')) return <Navigate to="/" />;
 */

export default function Router() {
  const { admin } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={admin ? <Navigate to="/admin" /> : <Login />}
      />
      <Route
        path="/admin"
        element={admin ? <AdminPanel /> : <Navigate to="/" />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="drivers" element={<DriversList />} />
        <Route path="passengers" element={<PassengersList />} />
        <Route path="rates" element={<RatesManagement />} />
        <Route path="complaints" element={<ComplaintsManagement />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="support" element={<SupportChat />} />
      </Route>
      {/* Página de error 404 profesional */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
