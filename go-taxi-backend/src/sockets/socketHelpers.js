// Estructura: [{ ws, userId, role, viajeId }]
let wsClients = [];

// Registrar nuevo cliente (autenticado)
function registerClient(ws, { userId, role, viajeId }) {
  ws.userId = userId;
  ws.role = role;
  ws.viajeId = viajeId;
  wsClients.push(ws);
}

// Eliminar cliente al desconectarse
function unregisterClient(ws) {
  wsClients = wsClients.filter(c => c !== ws);
}

// Buscar clientes por userId
function getClientsByUserId(userId) {
  return wsClients.filter(ws => ws.userId === userId);
}

// Buscar clientes por viajeId
function getClientsByViajeId(viajeId) {
  return wsClients.filter(ws => ws.viajeId === viajeId);
}

// Emitir mensaje a todos
function broadcast(data) {
  wsClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(JSON.stringify(data));
  });
}

// Emitir a todos los usuarios de un viaje
function emitToViaje(viajeId, data) {
  getClientsByViajeId(viajeId).forEach(ws => {
    if (ws.readyState === 1) ws.send(JSON.stringify(data));
  });
}

// Emitir a usuario específico
function emitToUser(userId, data) {
  getClientsByUserId(userId).forEach(ws => {
    if (ws.readyState === 1) ws.send(JSON.stringify(data));
  });
}

module.exports = {
  registerClient,
  unregisterClient,
  getClientsByUserId,
  getClientsByViajeId,
  broadcast,
  emitToViaje,
  emitToUser
};