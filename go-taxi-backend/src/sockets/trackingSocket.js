let wsClients = [];

function initTrackingSocket(server) {
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    wsClients.push(ws);
    ws.on('message', (message) => {
      // Broadcast para todos (ajusta la lógica según tu flujo)
      wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(message);
      });
    });
    ws.on('close', () => {
      wsClients = wsClients.filter(c => c !== ws);
    });
  });

  return wss;
}

module.exports = { initTrackingSocket };
