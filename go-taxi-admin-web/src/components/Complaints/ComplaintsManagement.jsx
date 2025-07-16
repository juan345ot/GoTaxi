import { useEffect, useState } from "react";
import { getComplaints, resolveComplaint } from "../../api/complaintsApi";

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    getComplaints()
      .then(setComplaints)
      .catch(() => setError("Error al cargar reclamos"))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await resolveComplaint(id);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "resuelto" } : c))
      );
      setSuccess("Reclamo resuelto correctamente");
    } catch (err) {
      setError("No se pudo resolver el reclamo");
    } finally {
      setResolvingId(null);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  }).filter(c => (
    c.user.toLowerCase().includes(search.toLowerCase()) ||
    c.message.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Reclamos</h2>
      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2">
          <option value="all">Todos</option>
          <option value="abierto">Abiertos</option>
          <option value="resuelto">Resueltos</option>
        </select>
        <input
          className="p-2 border rounded"
          placeholder="Buscar por usuario o mensaje..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <p>Cargando reclamos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <ul className="space-y-2">
        {filtered.map((c) => (
          <li key={c.id} className="border rounded p-3 bg-white flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <div><span className="font-bold">{c.user}</span> - {c.message}</div>
              <div className="text-sm text-gray-500">Estado: {c.status}</div>
            </div>
            {c.status === "abierto" && (
              <button
                disabled={resolvingId === c.id}
                onClick={() => handleResolve(c.id)}
                className="mt-2 md:mt-0 bg-green-500 text-white px-3 py-1 rounded"
              >
                {resolvingId === c.id ? "Resolviendo..." : "Marcar como resuelto"}
              </button>
            )}
          </li>
        ))}
        {!loading && filtered.length === 0 && <li>No hay reclamos.</li>}
      </ul>
    </div>
  );
}
