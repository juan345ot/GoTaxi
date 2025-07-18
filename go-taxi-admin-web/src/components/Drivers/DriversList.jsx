import { useEffect, useState } from "react";
import { getDrivers } from "../../api/driversApi";
import DriverApproval from "./DriverApproval";
import Loader from "../ui/Loader";

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    getDrivers()
      .then((res) => {
        if (res.error) setError(res.error);
        setDrivers(res.data || []);
      })
      .catch(() => setError("Error al cargar conductores"))
      .finally(() => setLoading(false));
  }, []);

  // Filtro por nombre, se puede ampliar a más campos (status, rating, etc)
  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) return <div className="flex items-center gap-2"><Loader size={5} />Cargando conductores...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl mb-4 font-semibold">Conductores</h2>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          className="p-2 border rounded"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-sm ml-2 text-gray-500">
          Mostrando {filtered.length} de {drivers.length}
        </span>
        {/* Aquí podés agregar más filtros en el futuro */}
      </div>
      {filtered.length === 0 && <p>No hay conductores.</p>}
      <div className="space-y-2">
        {paginated.map(driver => (
          <DriverApproval key={driver.id} driver={driver} />
        ))}
      </div>
      {/* Paginación */}
      {pageCount > 1 && (
        <div className="flex gap-2 justify-center mt-5">
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
