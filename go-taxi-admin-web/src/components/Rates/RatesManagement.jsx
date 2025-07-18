import { useEffect, useState } from "react";
import { getRates, updateRates } from "../../api/ratesApi";
import Loader from "../ui/Loader";

// Modal de confirmación simple
function ConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-xs text-center">
        <p className="mb-4">¿Seguro que quieres guardar los cambios de tarifas?</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onConfirm} className="bg-blue-600 text-white px-4 py-1 rounded">Sí</button>
          <button onClick={onCancel} className="bg-gray-300 px-4 py-1 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function RatesManagement() {
  const [rates, setRates] = useState({
    base: "",
    perKm: "",
    commission: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRates()
      .then((res) => {
        if (res.error) setError(res.error);
        else setRates(res.data || {});
      })
      .catch(() => setError("Error al cargar tarifas"))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => setEditing(true);

  const handleChange = (e) => {
    setRates({ ...rates, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (isNaN(Number(rates.base)) || Number(rates.base) < 0) return "Tarifa base inválida";
    if (isNaN(Number(rates.perKm)) || Number(rates.perKm) < 0) return "Tarifa por km inválida";
    if (isNaN(Number(rates.commission)) || Number(rates.commission) < 0 || Number(rates.commission) > 99) return "Comisión global inválida (0-99)";
    return null;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowConfirm(true); // Abrir modal de confirmación
  };

  const confirmSave = async () => {
    setSaving(true);
    setShowConfirm(false);
    setMsg(""); setError("");
    try {
      const res = await updateRates(rates);
      if (res.error) throw new Error(res.error);
      setEditing(false);
      setMsg("Tarifas actualizadas con éxito");
    } catch (err) {
      setError(err.message || "Error al guardar tarifas");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 2200);
  };

  if (loading) return <div className="flex items-center gap-2"><Loader size={5} />Cargando tarifas...</div>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tarifas</h2>
      {msg && <p className="text-green-600">{msg}</p>}
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3 max-w-xs">
          <div>
            <label className="block">Tarifa Base: </label>
            <input
              type="number"
              step="0.01"
              name="base"
              value={rates.base}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              min={0}
              required
            />
          </div>
          <div>
            <label className="block">Tarifa por KM: </label>
            <input
              type="number"
              step="0.01"
              name="perKm"
              value={rates.perKm}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              min={0}
              required
            />
          </div>
          <div>
            <label className="block">Comisión Global: </label>
            <input
              type="number"
              step="0.01"
              name="commission"
              value={rates.commission}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              min={0}
              max={99}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
            disabled={saving}
          >
            {saving ? <Loader size={4} /> : "Guardar"}
          </button>
        </form>
      ) : (
        <div>
          <div>Tarifa Base: <b>{rates.base}</b></div>
          <div>Tarifa por KM: <b>{rates.perKm}</b></div>
          <div>Comisión Global: <b>{rates.commission}</b></div>
          <button
            onClick={handleEdit}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Editar
          </button>
        </div>
      )}
      <ConfirmModal
        open={showConfirm}
        onConfirm={confirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
