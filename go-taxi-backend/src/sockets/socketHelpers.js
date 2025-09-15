/*
 * Helpers para gestionar conexiones WebSocket.
 *
 * Internamente mantiene un listado de clientes conectados con sus
 * identificadores de usuario, rol y viaje asociado. Provee funciones
 * para registrar, desregistrar y emitir mensajes a subconjuntos de
 * clientes de forma segura (comprobando que la conexión siga abierta).
 */

// Estructura: [WebSocket]
let wsClients = [];

// Constante para el estado abierto de WebSocket
const WS_OPEN = 1;

// Envía un mensaje a un cliente de manera segura (no lanza si la conexión está cerrada)
function safeSend(ws, data) {
  if (ws.readyState === WS_OPEN) {
    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      ws.send(payload);
    } catch (err) {
      // Ignorar errores de envío individuales
    }
  }
}

// Registrar nuevo cliente (autenticado)
function registerClient(ws, { userId, role, viajeId }) {
  ws.userId = userId;
  ws.role = role;
  ws.viajeId = viajeId;
  wsClients.push(ws);
}

// Eliminar cliente al desconectarse
function unregisterClient(ws) {
  wsClients = wsClients.filter((c) => c !== ws);
}

// Buscar clientes por userId
function getClientsByUserId(userId) {
  return wsClients.filter((ws) => ws.userId === userId);
}

// Buscar clientes por viajeId
function getClientsByViajeId(viajeId) {
  return wsClients.filter((ws) => ws.viajeId === viajeId);
}

// Emitir mensaje a todos
function broadcast(data) {
  wsClients.forEach((ws) => safeSend(ws, data));
}

// Emitir a todos los usuarios de un viaje
function emitToViaje(viajeId, data) {
  getClientsByViajeId(viajeId).forEach((ws) => safeSend(ws, data));
}

// Emitir a usuario específico
function emitToUser(userId, data) {
  getClientsByUserId(userId).forEach((ws) => safeSend(ws, data));
}

module.exports = {
  registerClient,
  unregisterClient,
  getClientsByUserId,
  getClientsByViajeId,
  broadcast,
  emitToViaje,
  emitToUser,
  safeSend,
};
