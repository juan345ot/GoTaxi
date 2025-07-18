import { useEffect, useState } from "react";
import { getPassengers } from "../../api/passengersApi";
import PassengerApproval from "./PassengerApproval";
import Loader from "../ui/Loader";

export default function PassengersList() {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    getPassengers()
      .then((res) => {
        if (res.error) setError(res.error);
        setPassengers(res.data || []);
      })
      .catch(() => setError("Error al cargar pasajeros"))
      .finally(() => setLoading(false));
  }, []);

  // Filtro por nombre (ampliable)
  const filtered = passengers.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pasajeros</h2>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          className="p-2 border rounded"
          placeholder="Buscar pasajero..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-sm ml-2 text-gray-500">
          Mostrando {filtered.length} de {passengers.length}
        </span>
        {/* Aquí podés agregar más filtros (estado, rating, etc) */}
      </div>
      {loading && <div className="flex items-center gap-2"><Loader size={5} />Cargando pasajeros...</div>}
      {error && <p className="text-red-500">{error}</p>}
      {filtered.length === 0 && !loading && <p>No hay pasajeros.</p>}
      <div className="space-y-2">
        {paginated.map(passenger => (
          <PassengerApproval key={passenger.id} passenger={passenger} />
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
