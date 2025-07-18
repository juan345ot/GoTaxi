import AdminLayout from "../components/Layout/AdminLayout";
import { Outlet } from "react-router-dom";

/**
 * Contenedor del panel de administración.
 * Usa el layout principal y renderiza el módulo según la ruta.
 */
export default function AdminPanel() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
