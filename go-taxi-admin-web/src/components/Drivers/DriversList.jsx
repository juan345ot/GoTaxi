import { useEffect, useState } from "react";
import { getDrivers } from "../../api/driversApi";
import DriverApproval from "./DriverApproval";

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDrivers()
      .then(setDrivers)
      .catch(() => setError("Error al cargar conductores"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl mb-4 font-semibold">Conductores</h2>
      <input
        className="mb-4 p-2 border rounded"
        placeholder="Buscar conductor..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered.length === 0 && <p>No hay conductores.</p>}
      <div className="space-y-2">
        {filtered.map(driver => (
          <DriverApproval key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
}
