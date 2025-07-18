import { NavLink } from "react-router-dom";
import {
  Users,
  UserCheck,
  DollarSign,
  MessageCircle,
  BarChart2,
  HelpCircle,
  Menu
} from "lucide-react";
import { useState } from "react";

const links = [
  {
    to: "/admin/drivers",
    label: "Conductores",
    icon: <Users size={20} />,
  },
  {
    to: "/admin/passengers",
    label: "Pasajeros",
    icon: <UserCheck size={20} />,
  },
  {
    to: "/admin/rates",
    label: "Tarifas",
    icon: <DollarSign size={20} />,
  },
  {
    to: "/admin/complaints",
    label: "Reclamos",
    icon: <MessageCircle size={20} />,
  },
  {
    to: "/admin/metrics",
    label: "Métricas",
    icon: <BarChart2 size={20} />,
  },
  {
    to: "/admin/support",
    label: "Soporte/Chat",
    icon: <HelpCircle size={20} />,
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  // Si querés hacerlo colapsable en mobile, esto lo habilita
  // En mobile (sm), el sidebar se oculta y se puede mostrar con un botón
  return (
    <>
      {/* Botón para abrir/cerrar el sidebar en mobile */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 bg-white rounded p-1 shadow border"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 md:translate-x-0 w-60 h-screen bg-white border-r fixed left-0 top-0 flex flex-col z-40`}
      >
        <div className="text-2xl font-bold p-6 border-b select-none">GoTaxi Admin</div>
        <nav className="flex-1 flex flex-col gap-1 px-4 py-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded transition hover:bg-gray-100 ${
                  isActive ? "bg-blue-100 text-blue-700 font-bold" : ""
                }`
              }
              onClick={() => setOpen(false)} // Cierra en mobile
              tabIndex={0}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Overlay en mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
