import { useState } from "react";
import { updateDriverCommission } from "../../api/driversApi";

export default function DriverDetails({ driver, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [commission, setCommission] = useState(driver.commission || 0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleEdit = () => setEditing(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDriverCommission(driver.id, commission);
      setMsg("Comisión actualizada");
      setEditing(false);
      onUpdate && onUpdate(commission);
    } catch {
      setMsg("Error al actualizar comisión");
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
              max={100}
            />
            <button
              className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="ml-2 px-2 py-1 bg-gray-300 text-black rounded"
              onClick={() => setEditing(false)}
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
            >
              Editar
            </button>
          </>
        )}
      </div>
      {msg && <div className="mt-2 text-green-600">{msg}</div>}
    </div>
  );
}
