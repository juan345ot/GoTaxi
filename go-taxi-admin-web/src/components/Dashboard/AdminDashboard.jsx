import AdminLayout from "../Layout/AdminLayout";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Panel de Administración GoTaxi</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Conductores" to="/admin/drivers" />
          <DashboardCard title="Pasajeros" to="/admin/passengers" />
          <DashboardCard title="Tarifas" to="/admin/rates" />
          <DashboardCard title="Reclamos" to="/admin/complaints" />
          <DashboardCard title="Métricas" to="/admin/metrics" />
          <DashboardCard title="Soporte/Chat" to="/admin/support" />
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, to }) {
  return (
    <Link to={to} className="bg-white shadow rounded p-8 flex flex-col items-center justify-center hover:shadow-lg transition">
      <span className="text-lg font-semibold mb-2">{title}</span>
      <span className="text-blue-600">Ir &rarr;</span>
    </Link>
  );
}
