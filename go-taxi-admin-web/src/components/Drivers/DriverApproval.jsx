import { approveDriver, rejectDriver, updateDriverCommission } from "../../api/driversApi";
import { useState } from "react";

export default function DriverApproval({ driver }) {
  const [commission, setCommission] = useState(driver.commission || 0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const handleApprove = async () => {
    await approveDriver(driver.id, driver.rank <= 5);
    setMessage("Conductor aprobado.");
  };
  const handleReject = async () => {
    await rejectDriver(driver.id);
    setMessage("Conductor rechazado.");
  };
  const handleSaveCommission = async () => {
    await updateDriverCommission(driver.id, commission);
    setEditing(false);
    setMessage("Comisión actualizada.");
  };

  return (
    <div className="border rounded p-3 flex justify-between items-center bg-white">
      <div>
        <div className="font-bold">{driver.name}</div>
        <div>Comisión: {editing ? (
          <>
            <input type="number" value={commission} onChange={e => setCommission(e.target.value)} className="w-16 border rounded px-1" />
            <button onClick={handleSaveCommission} className="ml-2 text-green-600">Guardar</button>
          </>
        ) : (
          <>
            {commission}% <button onClick={() => setEditing(true)} className="ml-2 text-blue-600">Editar</button>
          </>
        )}</div>
        <div>Calificación: {driver.rating} ⭐</div>
        <div>Estado: {driver.status}</div>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={handleApprove} className="bg-green-500 text-white px-3 py-1 rounded">Aprobar</button>
        <button onClick={handleReject} className="bg-red-500 text-white px-3 py-1 rounded">Rechazar</button>
      </div>
      {message && <span className="ml-4 text-sm text-green-600">{message}</span>}
    </div>
  );
}
