import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
// import { API_URL } from '../config/api'; // Asumiendo que existe config

// URL del socket (debe coincidir con el backend)
// Si no hay archivo de config, usar una constante o variable de entorno
const SOCKET_URL = 'http://192.168.1.5:3000'; // Ajustar según entorno

export const useTripNotifications = () => {
  const [incomingTrip, setIncomingTrip] = useState(null);
  const socketRef = useRef(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;

    // Inicializar socket
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      query: { role: 'conductor' },
      transports: ['websocket'],
    });

    // Conectar
    socketRef.current.on('connect', () => {
      console.log('Socket conectado como conductor:', socketRef.current.id);
      // Registrar usuario para recibir notificaciones personales
      socketRef.current.emit('register', { userId: user.id, role: 'conductor' });
    });

    // Escuchar solicitudes de viaje
    socketRef.current.on('trip_request', (data) => {
      console.log('Nueva solicitud de viaje recibida:', data);
      setIncomingTrip(data);
    });

    // Manejar errores
    socketRef.current.on('connect_error', (err) => {
      console.error('Error de conexión socket:', err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token]);

  const clearNotification = () => {
    setIncomingTrip(null);
  };

  return { incomingTrip, clearNotification };
};
