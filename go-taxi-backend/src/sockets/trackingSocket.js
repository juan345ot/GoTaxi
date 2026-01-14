const WebSocket = require('ws');
const helpers = require('./socketHelpers');
const { logToFile } = require('../utils/logger');

/**
 * Inicializa el servidor WebSocket sobre tu HTTP server Express.
 * Permite tracking real-time y otros eventos por viaje o usuario.
 *
 * Conexión: handshake inicial con mensaje { type: 'auth', userId, role, viajeId }
 */
function initTrackingSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    // Log de conexión
    logToFile(`Nueva conexión WebSocket desde ${req.socket.remoteAddress}`);

    ws.on('message', data => {
      let msg;
      try {
        msg = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (_e) {
        helpers.safeSend(ws, { type: 'error', message: 'Formato de mensaje inválido' });
        return;
      }

      const { type } = msg;
      switch (type) {
        case 'auth': {
          // Handshake inicial: se requiere userId y role
          const { userId, role, viajeId } = msg;
          if (!userId || !role) {
            helpers.safeSend(ws, { type: 'error', message: 'Faltan datos de autenticación' });
            return;
          }
          helpers.registerClient(ws, { userId, role, viajeId });
          helpers.safeSend(ws, { type: 'auth', status: 'ok' });
          logToFile(`Cliente autenticado (userId=${userId}, role=${role}, viajeId=${viajeId})`);
          return;
        }

        case 'location': {
          // { type: 'location', viajeId, lat, lng }
          const { viajeId, lat, lng } = msg;
          if (ws.role !== 'conductor') {
            helpers.safeSend(ws, { type: 'error', message: 'No autorizado para enviar ubicación' });
            return;
          }
          if (!viajeId || viajeId !== ws.viajeId || lat == null || lng == null) {
            helpers.safeSend(ws, { type: 'error', message: 'Datos de ubicación incompletos' });
            return;
          }
          helpers.emitToViaje(viajeId, {
            type: 'location',
            conductorId: ws.userId,
            lat,
            lng,
          });
          return;
        }

        case 'status': {
          // { type: 'status', viajeId, estado }
          const { viajeId, estado } = msg;
          if (!viajeId || !estado) {
            helpers.safeSend(ws, { type: 'error', message: 'Datos de estado incompletos' });
            return;
          }
          helpers.emitToViaje(viajeId, {
            type: 'status',
            viajeId,
            estado,
          });
          return;
        }

        case 'sos': {
          // { type: 'sos', viajeId, alerta }
          const { viajeId, alerta } = msg;
          if (!viajeId || !alerta) {
            helpers.safeSend(ws, { type: 'error', message: 'Datos de SOS incompletos' });
            return;
          }
          helpers.emitToViaje(viajeId, {
            type: 'sos',
            userId: ws.userId,
            viajeId,
            alerta,
          });
          return;
        }

        default:
          helpers.safeSend(ws, { type: 'error', message: 'Tipo de mensaje no soportado' });
      }
    });

    ws.on('close', () => {
      helpers.unregisterClient(ws);
      logToFile(`Cliente WebSocket desconectado (userId=${ws.userId || 'desconocido'})`);
    });
  });

  // eslint-disable-next-line no-console
  console.log('🟢 WebSocket Tracking Server iniciado');
  return wss;
}

module.exports = { initTrackingSocket };
