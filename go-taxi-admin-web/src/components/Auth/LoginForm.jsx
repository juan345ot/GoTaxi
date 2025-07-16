import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
      <input type="password" onChange={(e) => setPassword(e.target.value)} required placeholder="Contraseña" />
      <button type="submit">Ingresar</button>
    </form>
  );
}
