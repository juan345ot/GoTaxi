# Carpeta sockets/

Aquí está la lógica de WebSocket (tracking en tiempo real).

## Eventos recomendados

- **auth**: handshake inicial con los campos `userId`, `role` y, de manera
  opcional, `viajeId`. Este evento debe ser lo primero que se envía tras abrir
  la conexión.
- **location**: envío de `lat`/`lng` en tiempo real desde el conductor. Sólo
  usuarios con rol `conductor` pueden emitir este evento y deben haber
  especificado su `viajeId` en el evento `auth`.
- **status**: cambios en el estado del viaje (por ejemplo: `pendiente`,
  `asignado`, `en_curso`, `finalizado`, `cancelado`).
- **sos**: alerta de emergencia para todos los usuarios de un viaje. Incluye un
  campo `alerta` con la descripción.
- **notificación**: mensaje push para usuarios conectados (reservado para
  futuras ampliaciones).

## Ejemplo de mensaje desde la app

```json
{ "type": "auth", "userId": "...", "role": "conductor", "viajeId": "..." }
{ "type": "location", "viajeId": "...", "lat": -37.12, "lng": -61.10 }
```
