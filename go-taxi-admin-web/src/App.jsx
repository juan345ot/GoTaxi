import Router from "./router";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white px-4 py-2 rounded shadow text-lg">
            Cargando...
          </div>
        </div>
      )}
      <Router />
    </div>
  );
}
