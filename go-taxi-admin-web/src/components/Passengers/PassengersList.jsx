import { useEffect, useState } from "react";
import { getPassengers, approvePassenger, rejectPassenger } from "../../api/passengersApi";
import PassengerApproval from "./PassengerApproval";

export default function PassengersList() {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPassengers()
      .then(setPassengers)
      .catch(() => setError("Error al cargar pasajeros"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = passengers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pasajeros</h2>
      <input
        className="mb-4 p-2 border rounded"
        placeholder="Buscar pasajero..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading && <p>Cargando pasajeros...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {filtered.length === 0 && !loading && <p>No hay pasajeros.</p>}
      <div className="space-y-2">
        {filtered.map(passenger => (
          <PassengerApproval key={passenger.id} passenger={passenger} />
        ))}
      </div>
    </div>
  );
}
