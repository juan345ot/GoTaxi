import AdminLayout from "../Layout/AdminLayout";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  DollarSign,
  MessageCircle,
  BarChart2,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

// Ejemplo de métricas rápidas (pueden venir de API en futuro)
const quickStats = [
  { label: "Viajes activos", value: 4, icon: <BarChart2 className="text-yellow-500" /> },
  { label: "Conductores pendientes", value: 2, icon: <UserCheck className="text-red-500" /> },
  { label: "Reclamos sin resolver", value: 1, icon: <AlertTriangle className="text-orange-500" /> },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Panel de Administración GoTaxi</h1>
        {/* Alertas/Métricas rápidas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-blue-50 border border-blue-100 rounded shadow p-4 flex items-center gap-4"
            >
              <div className="bg-white rounded-full p-2 shadow-sm">{icon}</div>
              <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-gray-700">{label}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Menú principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Conductores"
            icon={<Users size={32} />}
            to="/admin/drivers"
          />
          <DashboardCard
            title="Pasajeros"
            icon={<UserCheck size={32} />}
            to="/admin/passengers"
          />
          <DashboardCard
            title="Tarifas"
            icon={<DollarSign size={32} />}
            to="/admin/rates"
          />
          <DashboardCard
            title="Reclamos"
            icon={<MessageCircle size={32} />}
            to="/admin/complaints"
          />
          <DashboardCard
            title="Métricas"
            icon={<BarChart2 size={32} />}
            to="/admin/metrics"
          />
          <DashboardCard
            title="Soporte/Chat"
            icon={<HelpCircle size={32} />}
            to="/admin/support"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, icon, to }) {
  return (
    <Link
      to={to}
      className="bg-white shadow rounded p-8 flex flex-col items-center justify-center hover:shadow-lg transition group border hover:border-blue-500"
    >
      <span className="mb-3 text-blue-600 group-hover:scale-110 transition">{icon}</span>
      <span className="text-lg font-semibold mb-2">{title}</span>
      <span className="text-blue-600 group-hover:underline">Ir &rarr;</span>
    </Link>
  );
}
