import { approvePassenger, rejectPassenger } from "../../api/passengersApi";
import { useState } from "react";
import Loader from "../ui/Loader";

export default function PassengerApproval({ passenger }) {
  const [status, setStatus] = useState(passenger.status);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(""); // "approve" o "reject"
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setAction("approve");
    setLoading(true);
    setError(""); setMsg("");
    try {
      const res = await approvePassenger(passenger.id);
      if (res.error) throw new Error(res.error);
      setStatus("aprobado");
      setMsg("Pasajero aprobado.");
    } catch (err) {
      setError(err.message || "Error al aprobar pasajero.");
    }
    setLoading(false);
    setTimeout(() => { setMsg(""); setError(""); }, 2000);
  };

  const handleReject = async () => {
    setAction("reject");
    setLoading(true);
    setError(""); setMsg("");
    try {
      const res = await rejectPassenger(passenger.id);
      if (res.error) throw new Error(res.error);
      setStatus("rechazado");
      setMsg("Pasajero rechazado.");
    } catch (err) {
      setError(err.message || "Error al rechazar pasajero.");
    }
    setLoading(false);
    setTimeout(() => { setMsg(""); setError(""); }, 2000);
  };

  return (
    <div className="border rounded p-3 flex flex-col md:flex-row md:justify-between items-center bg-white shadow-sm">
      <div>
        <div className="font-bold">{passenger.name}</div>
        <div>Estado: {status}</div>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button
          onClick={handleApprove}
          disabled={loading || status === "aprobado"}
          className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-2"
        >
          {loading && action === "approve" ? <Loader size={4} /> : "Aprobar"}
        </button>
        <button
          onClick={handleReject}
          disabled={loading || status === "rechazado"}
          className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-2"
        >
          {loading && action === "reject" ? <Loader size={4} /> : "Rechazar"}
        </button>
      </div>
      {msg && <span className="ml-4 text-green-700 bg-green-100 px-2 py-1 rounded text-sm">{msg}</span>}
      {error && <span className="ml-4 text-red-700 bg-red-100 px-2 py-1 rounded text-sm">{error}</span>}
    </div>
  );
}
