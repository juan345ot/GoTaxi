import { useEffect, useState } from "react";
import {
  getComplaints,
  resolveComplaint,
  getComplaintDetails,
} from "../../api/complaintsApi";
import Loader from "../ui/Loader";

// Modal simple para detalle de reclamo
function ComplaintModal({ open, complaint, onClose }) {
  if (!open || !complaint) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-full max-w-lg shadow-xl relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-2">Detalle del reclamo</h3>
        <div><b>Usuario:</b> {complaint.user}</div>
        <div><b>Mensaje:</b> {complaint.message}</div>
        <div><b>Estado:</b> {complaint.status}</div>
        <div><b>Fecha:</b> {complaint.date || "N/D"}</div>
        <div><b>ID:</b> {complaint.id}</div>
      </div>
    </div>
  );
}

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal de detalle
  const [openModal, setOpenModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Paginación simple
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    getComplaints()
      .then((res) => {
        setComplaints(res.data || []);
        if (res.error) setError(res.error);
      })
      .catch(() => setError("Error al cargar reclamos"))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const res = await resolveComplaint(id);
      if (res.error) throw new Error(res.error);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "resuelto" } : c))
      );
      setToast({ type: "success", msg: "Reclamo resuelto correctamente" });
    } catch (err) {
      setToast({ type: "error", msg: err.message || "No se pudo resolver el reclamo" });
    } finally {
      setResolvingId(null);
      setTimeout(() => setToast(null), 2200);
    }
  };

  // Modal de detalle de reclamo
  const handleOpenModal = async (id) => {
    setLoading(true);
    const res = await getComplaintDetails(id);
    if (res.data) {
      setSelectedComplaint(res.data);
      setOpenModal(true);
    }
    setLoading(false);
  };

  const filtered = complaints
    .filter((c) => (filter === "all" ? true : c.status === filter))
    .filter(
      (c) =>
        c.user?.toLowerCase().includes(search.toLowerCase()) ||
        c.message?.toLowerCase().includes(search.toLowerCase())
    );

  // Paginación
  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Reclamos</h2>
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">Todos</option>
          <option value="abierto">Abiertos</option>
          <option value="resuelto">Resueltos</option>
        </select>
        <input
          className="p-2 border rounded"
          placeholder="Buscar por usuario o mensaje..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading && (
        <div className="flex items-center gap-2"><Loader size={5} /> Cargando reclamos...</div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {toast && (
        <div
          className={`mb-2 px-3 py-2 rounded text-sm ${
            toast.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}
        >
          {toast.msg}
        </div>
      )}
      <ul className="space-y-2">
        {paginated.map((c) => (
          <li
            key={c.id}
            className="border rounded p-3 bg-white flex flex-col md:flex-row md:justify-between md:items-center hover:bg-gray-50 cursor-pointer transition"
            tabIndex={0}
            onClick={() => handleOpenModal(c.id)}
            aria-label={`Ver detalle del reclamo de ${c.user}`}
          >
            <div>
              <div>
                <span className="font-bold">{c.user}</span> - {c.message}
              </div>
              <div className="text-sm text-gray-500">Estado: {c.status}</div>
            </div>
            {c.status === "abierto" && (
              <button
                disabled={resolvingId === c.id}
                onClick={e => {
                  e.stopPropagation();
                  handleResolve(c.id);
                }}
                className="mt-2 md:mt-0 bg-green-500 text-white px-3 py-1 rounded"
              >
                {resolvingId === c.id ? <Loader size={4} /> : "Marcar como resuelto"}
              </button>
            )}
          </li>
        ))}
        {!loading && paginated.length === 0 && <li>No hay reclamos.</li>}
      </ul>
      {/* Paginación */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
      {/* Modal detalle */}
      <ComplaintModal
        open={openModal}
        complaint={selectedComplaint}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
