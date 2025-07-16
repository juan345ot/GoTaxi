import AdminLayout from "../components/Layout/AdminLayout";
import { Outlet } from "react-router-dom";

export default function AdminPanel() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
