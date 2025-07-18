import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../ui/Loader";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const validate = () => {
    if (!email || !email.includes("@")) return "Email inválido";
    if (!password || password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password, remember });
      if (res?.error) {
        setError(res.error);
      }
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
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-6 bg-white rounded shadow"
      autoComplete="on"
    >
      <h2 className="text-2xl mb-4 font-bold text-center">Login Admin</h2>
      <label htmlFor="login-email" className="block mb-2 font-semibold">
        Email
      </label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border rounded w-full p-2 mb-4"
        placeholder="admin@email.com"
        required
        autoFocus
      />
      <label htmlFor="login-password" className="block mb-2 font-semibold">
        Contraseña
      </label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border rounded w-full p-2 mb-2"
        placeholder="••••••••"
        required
      />

      <div className="flex items-center mb-4">
        <input
          id="remember"
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="remember" className="text-sm">Recordar sesión</label>
        <button
          type="button"
          className="ml-auto text-xs text-blue-600 hover:underline"
          tabIndex={-1}
          onClick={() => alert("Funcionalidad próximamente")}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded font-semibold flex justify-center items-center"
        disabled={loading}
      >
        {loading ? <Loader size={5} /> : "Ingresar"}
      </button>
    </form>
  );
}
