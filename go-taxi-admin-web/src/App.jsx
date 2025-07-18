import Router from "./router";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/ui/Loader";
// Si querés agregar notificaciones, podés importar aquí tu Toaster (ej: sonner/hot-toast)

export default function App() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Loader global */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white px-4 py-2 rounded shadow text-lg flex items-center gap-3">
            <Loader size={6} />
            Cargando...
          </div>
        </div>
      )}
      {/* Aquí podrías agregar <Toaster /> si implementás feedback global */}
      <Router />
    </div>
  );
}
