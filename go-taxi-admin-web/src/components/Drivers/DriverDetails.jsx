import { useState } from "react";
import { updateDriverCommission } from "../../api/driversApi";
import Loader from "../ui/Loader";

export default function DriverDetails({ driver, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [commission, setCommission] = useState(driver.commission || 0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleEdit = () => {
    setMsg("");
    setError("");
    setEditing(true);
  };

  const handleSave = async () => {
    if (isNaN(commission) || commission < 0 || commission > 99) {
      setError("Comisión inválida (0-99)");
      return;
    }
    setSaving(true);
    try {
      const res = await updateDriverCommission(driver.id, commission);
      if (res.error) throw new Error(res.error);
      setMsg("Comisión actualizada");
      setEditing(false);
      setError("");
      onUpdate && onUpdate(commission);
    } catch (err) {
      setError(err.message || "Error al actualizar comisión");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md mb-4">
      <h3 className="text-lg font-bold mb-2">{driver.name}</h3>
      <div><b>Email:</b> {driver.email}</div>
      <div><b>Teléfono:</b> {driver.phone}</div>
      <div><b>Calificación:</b> {driver.rating} ⭐</div>
      <div><b>Viajes:</b> {driver.trips}</div>
      <div className="flex items-center mt-2">
        <b>Comisión:</b>
        {editing ? (
          <>
            <input
              type="number"
              className="ml-2 w-16 border px-1 rounded"
              value={commission}
              onChange={e => setCommission(Number(e.target.value))}
              min={0}
              max={99}
              disabled={saving}
            />
            <button
              className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader size={4} /> : "Guardar"}
            </button>
            <button
              className="ml-2 px-2 py-1 bg-gray-300 text-black rounded"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span className="ml-2">{commission}%</span>
            <button
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              onClick={handleEdit}
              disabled={saving}
            >
              Editar
            </button>
          </>
        )}
      </div>
      {msg && <div className="mt-2 text-green-600 bg-green-100 rounded px-2 py-1">{msg}</div>}
      {error && <div className="mt-2 text-red-600 bg-red-100 rounded px-2 py-1">{error}</div>}
    </div>
  );
}
