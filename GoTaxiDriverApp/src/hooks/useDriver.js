import { useState } from 'react';

// Ejemplo de hook para manejar estado global del conductor
export default function useDriver() {
  const [driver, setDriver] = useState(null);
  const [active, setActive] = useState(false);
  return { driver, setDriver, active, setActive };
}
