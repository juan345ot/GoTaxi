import Sidebar from "./Sidebar";
// Si quieres un header global, podrías importarlo aquí
// import Header from "./Header";

export default function AdminLayout({ children }) {
  // En el futuro: podés controlar el sidebar para mobile con useState y un botón
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar lateral fijo */}
      <Sidebar />
      {/* Main content */}
      <main
        className="ml-60 flex-1 p-4 md:p-8"
        tabIndex={-1}
        aria-label="Contenido principal"
      >
        {/* Aquí podrías poner un header si lo necesitás */}
        {/* <Header /> */}
        {children}
      </main>
    </div>
  );
}
