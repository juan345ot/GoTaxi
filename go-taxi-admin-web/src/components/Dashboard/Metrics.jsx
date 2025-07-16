import { useEffect, useState } from "react";
import { getMetrics } from "../../api/metricsApi";

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch(() => setError("Error al cargar métricas"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando métricas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!metrics) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Métricas</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Viajes totales</div>
          <div className="text-2xl">{metrics.trips}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Conductores activos</div>
          <div className="text-2xl">{metrics.activeDrivers}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Usuarios activos</div>
          <div className="text-2xl">{metrics.activeUsers}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Comisiones</div>
          <div className="text-2xl">${metrics.commissions}</div>
        </div>
      </div>
    </div>
  );
}
