import { NavLink } from "react-router-dom";
export default function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-white border-r fixed left-0 top-0 flex flex-col z-10">
      <div className="text-2xl font-bold p-6 border-b">GoTaxi Admin</div>
      <nav className="flex-1 flex flex-col gap-2 px-4 py-8">
        <NavLink to="/admin/drivers" className="p-2 rounded hover:bg-gray-100">Conductores</NavLink>
        <NavLink to="/admin/passengers" className="p-2 rounded hover:bg-gray-100">Pasajeros</NavLink>
        <NavLink to="/admin/rates" className="p-2 rounded hover:bg-gray-100">Tarifas</NavLink>
        <NavLink to="/admin/complaints" className="p-2 rounded hover:bg-gray-100">Reclamos</NavLink>
        <NavLink to="/admin/metrics" className="p-2 rounded hover:bg-gray-100">Métricas</NavLink>
        <NavLink to="/admin/support" className="p-2 rounded hover:bg-gray-100">Soporte/Chat</NavLink>
        
      </nav>
    </aside>
  );
}
