const WebSocket = require('ws');
const helpers = require('./socketHelpers');

/**
 * Inicializa el servidor WebSocket sobre tu HTTP server Express.
 * Permite tracking real-time y otros eventos por viaje o usuario.
 * 
 * Conexión: handshake inicial con mensaje { type: 'auth', userId, role, viajeId }
 */
function initTrackingSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        // 1. Autenticación: registrar cliente
        if (msg.type === 'auth') {
          // { type: "auth", userId, role, viajeId }
          helpers.registerClient(ws, msg);
          ws.send(JSON.stringify({ type: 'auth', status: 'ok' }));
          return;
        }

        // 2. Tracking ubicación (solo conductores)
        if (msg.type === 'location') {
          // { type: "location", viajeId, lat, lng }
          // Requiere ws.userId y ws.viajeId ya registrados
          if (ws.role === 'conductor' && ws.viajeId === msg.viajeId) {
            helpers.emitToViaje(msg.viajeId, {
              type: 'location',
              conductorId: ws.userId,
              lat: msg.lat,
              lng: msg.lng
            });
          }
          return;
        }

        // 3. Cambios de estado de viaje (ejemplo)
        if (msg.type === 'status') {
          // { type: "status", viajeId, estado }
          helpers.emitToViaje(msg.viajeId, {
            type: 'status',
            viajeId: msg.viajeId,
            estado: msg.estado
          });
          return;
        }

        // 4. Botón SOS, alertas, etc.
        if (msg.type === 'sos') {
          helpers.emitToViaje(msg.viajeId, {
            type: 'sos',
            userId: ws.userId,
            viajeId: msg.viajeId,
            alerta: msg.alerta
          });
          return;
        }

        // Otros eventos custom...

      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Formato de mensaje inválido' }));
      }
    });

    ws.on('close', () => {
      helpers.unregisterClient(ws);
    });
  });

  console.log('🟢 WebSocket Tracking Server iniciado');
  return wss;
}

module.exports = { initTrackingSocket };