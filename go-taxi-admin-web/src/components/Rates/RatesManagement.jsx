import { useEffect, useState } from "react";
import { getRates, updateRates } from "../../api/ratesApi";

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

  useEffect(() => {
    setLoading(true);
    getRates()
      .then(setRates)
      .catch(() => setError("Error al cargar tarifas"))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => setEditing(true);

  const handleChange = (e) => {
    setRates({ ...rates, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      await updateRates(rates);
      setEditing(false);
      setMsg("Tarifas actualizadas con éxito");
    } catch {
      setError("Error al guardar tarifas");
    }
  };

  if (loading) return <p>Cargando tarifas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tarifas</h2>
      {msg && <p className="text-green-600">{msg}</p>}
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block">Tarifa Base: </label>
            <input type="number" step="0.01" name="base" value={rates.base} onChange={handleChange} className="border rounded p-2" />
          </div>
          <div>
            <label className="block">Tarifa por KM: </label>
            <input type="number" step="0.01" name="perKm" value={rates.perKm} onChange={handleChange} className="border rounded p-2" />
          </div>
          <div>
            <label className="block">Comisión Global: </label>
            <input type="number" step="0.01" name="commission" value={rates.commission} onChange={handleChange} className="border rounded p-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </form>
      ) : (
        <div>
          <div>Tarifa Base: <b>{rates.base}</b></div>
          <div>Tarifa por KM: <b>{rates.perKm}</b></div>
          <div>Comisión Global: <b>{rates.commission}</b></div>
          <button onClick={handleEdit} className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded">Editar</button>
        </div>
      )}
    </div>
  );
}
