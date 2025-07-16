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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
