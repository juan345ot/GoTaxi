import { approvePassenger, rejectPassenger } from "../../api/passengersApi";
import { useState } from "react";

export default function PassengerApproval({ passenger }) {
  const [status, setStatus] = useState(passenger.status);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approvePassenger(passenger.id);
      setStatus("aprobado");
      setMsg("Pasajero aprobado.");
    } catch {
      setMsg("Error al aprobar pasajero.");
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectPassenger(passenger.id);
      setStatus("rechazado");
      setMsg("Pasajero rechazado.");
    } catch {
      setMsg("Error al rechazar pasajero.");
    }
    setLoading(false);
  };

  return (
    <div className="border rounded p-3 flex flex-col md:flex-row md:justify-between items-center bg-white">
      <div>
        <div className="font-bold">{passenger.name}</div>
        <div>Estado: {status}</div>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button onClick={handleApprove} disabled={loading || status === "aprobado"} className="bg-green-500 text-white px-3 py-1 rounded">Aprobar</button>
        <button onClick={handleReject} disabled={loading || status === "rechazado"} className="bg-red-500 text-white px-3 py-1 rounded">Rechazar</button>
      </div>
      {msg && <span className="text-green-600 ml-4">{msg}</span>}
    </div>
  );
}
