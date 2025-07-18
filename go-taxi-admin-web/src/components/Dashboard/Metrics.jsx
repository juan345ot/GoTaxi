import { useEffect, useState } from "react";
import { getMetrics, getMetricsTrends } from "../../api/metricsApi";
import Loader from "../ui/Loader";
import { BarChart2, Users, UserCheck, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMetrics()
      .then(res => {
        if (res.error) setError(res.error);
        setMetrics(res.data || null);
      })
      .catch(() => setError("Error al cargar métricas"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoadingTrends(true);
    getMetricsTrends("week") // "week", "month", etc.
      .then(res => setTrends(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingTrends(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2"><Loader size={6} />Cargando métricas...</div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!metrics) return null;

  // Ejemplo de alerta rápida si hay pocos conductores activos
  const lowDrivers = metrics.activeDrivers < 5;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Métricas</h2>
      {/* Alertas rápidas */}
      {lowDrivers && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-900 flex items-center gap-2">
          <BarChart2 className="text-yellow-600" /> ¡Atención! Hay menos de 5 conductores activos.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<BarChart2 size={28} />}
          label="Viajes totales"
          value={metrics.trips}
        />
        <MetricCard
          icon={<Users size={28} />}
          label="Conductores activos"
          value={metrics.activeDrivers}
        />
        <MetricCard
          icon={<UserCheck size={28} />}
          label="Usuarios activos"
          value={metrics.activeUsers}
        />
        <MetricCard
          icon={<DollarSign size={28} />}
          label="Comisiones"
          value={`$${metrics.commissions}`}
        />
      </div>
      {/* Gráfico de tendencias */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Viajes por día (última semana)</h3>
        {loadingTrends ? (
          <Loader size={6} />
        ) : trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Sin datos suficientes para mostrar tendencias.</p>
        )}
      </div>
      {/* Gráfico adicional: ingresos por semana */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Ingresos (última semana)</h3>
        {loadingTrends ? (
          <Loader size={6} />
        ) : trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Sin datos de ingresos.</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center">
      <span className="mb-1 text-blue-600">{icon}</span>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
