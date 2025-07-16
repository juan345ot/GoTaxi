import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

export default function Router() {
  const { admin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={admin ? <Navigate to="/admin" /> : <Login />} />
      <Route path="/admin/*" element={admin ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
