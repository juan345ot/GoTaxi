import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      // Redirección la hace el contexto/router
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Credenciales inválidas"
      );
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4 font-bold text-center">Login Admin</h2>
      <label className="block mb-2 font-semibold">Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border rounded w-full p-2 mb-4"
        placeholder="admin@email.com"
        required
      />
      <label className="block mb-2 font-semibold">Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border rounded w-full p-2 mb-4"
        placeholder="••••••••"
        required
      />
      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded font-semibold"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
