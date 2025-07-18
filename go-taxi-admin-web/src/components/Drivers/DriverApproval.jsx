import { approveDriver, rejectDriver, updateDriverCommission } from "../../api/driversApi";
import { useState } from "react";
import Loader from "../ui/Loader";

export default function DriverApproval({ driver }) {
  const [commission, setCommission] = useState(driver.commission || 0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(""); // "approve", "reject", "commission"

  const handleApprove = async () => {
    setAction("approve");
    setLoading(true);
    try {
      const res = await approveDriver(driver.id, driver.rank <= 5);
      if (res.error) throw new Error(res.error);
      setMessage("Conductor aprobado.");
    } catch (err) {
      setMessage(err.message || "Error al aprobar conductor.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 1800);
  };

  const handleReject = async () => {
    setAction("reject");
    setLoading(true);
    try {
      const res = await rejectDriver(driver.id);
      if (res.error) throw new Error(res.error);
      setMessage("Conductor rechazado.");
    } catch (err) {
      setMessage(err.message || "Error al rechazar conductor.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 1800);
  };

  const handleSaveCommission = async () => {
    if (isNaN(commission) || commission < 0 || commission > 99) {
      setMessage("Comisión inválida");
      return;
    }
    setAction("commission");
    setLoading(true);
    try {
      const res = await updateDriverCommission(driver.id, commission);
      if (res.error) throw new Error(res.error);
      setEditing(false);
      setMessage("Comisión actualizada.");
    } catch (err) {
      setMessage(err.message || "Error al actualizar comisión.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 1800);
  };

  return (
    <div className="border rounded p-3 flex justify-between items-center bg-white shadow-sm">
      <div>
        <div className="font-bold">{driver.name}</div>
        <div className="mt-1">
          Comisión:{" "}
          {editing ? (
            <>
              <input
                type="number"
                min={0}
                max={99}
                value={commission}
                onChange={e => setCommission(e.target.value)}
                className="w-16 border rounded px-1"
                disabled={loading && action === "commission"}
              />
              <button
                onClick={handleSaveCommission}
                className="ml-2 text-green-600"
                disabled={loading && action === "commission"}
              >
                {loading && action === "commission" ? <Loader size={4} /> : "Guardar"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="ml-2 text-gray-500"
                disabled={loading && action === "commission"}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              {commission}%{" "}
              <button
                onClick={() => setEditing(true)}
                className="ml-2 text-blue-600"
                disabled={loading}
              >
                Editar
              </button>
            </>
          )}
        </div>
        <div className="mt-1">Calificación: {driver.rating} ⭐</div>
        <div className="mt-1">Estado: {driver.status}</div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleApprove}
          className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-2"
          disabled={loading && action === "approve"}
        >
          {loading && action === "approve" ? <Loader size={4} /> : "Aprobar"}
        </button>
        <button
          onClick={handleReject}
          className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-2"
          disabled={loading && action === "reject"}
        >
          {loading && action === "reject" ? <Loader size={4} /> : "Rechazar"}
        </button>
      </div>
      {message && (
        <span className="ml-4 text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
          {message}
        </span>
      )}
    </div>
  );
}
