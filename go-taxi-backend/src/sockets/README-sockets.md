# Carpeta sockets/

Aquí está la lógica de WebSocket (tracking en tiempo real).

## Eventos recomendados:
- **auth**: handshake con userId y role
- **location**: envío de lat/lng en tiempo real de conductor
- **status**: actualización de estado de viaje (ej: asignado, en_curso, finalizado)
- **sos**: botón de emergencia
- **notificación**: mensaje push para usuarios conectados

## Ejemplo de mensaje desde app:
```json
{ "type": "auth", "userId": "...", "role": "conductor" }
{ "type": "location", "lat": -37.12, "lng": -61.10 }
