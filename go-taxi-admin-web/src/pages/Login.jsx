import LoginForm from "../components/Auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

/**
 * Página de login de administrador.
 * Redirige al panel si ya hay sesión.
 */
export default function Login() {
  const { admin } = useAuth();
  if (admin) return <Navigate to="/admin" />;
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
}
