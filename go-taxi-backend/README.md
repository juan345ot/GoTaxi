# GoTaxi Backend

Backend Express.js + MongoDB para la plataforma GoTaxi (Pasajeros, Conductores y Admin Web).

## Comandos

- `npm install` - Instala dependencias
- `npm run dev` - Arranca en modo desarrollo (hot reload)
- `npm start` - Arranca en modo producción

## Variables de entorno (.env)

Copia el archivo `.env.example` a `.env` y completa los datos.

## Stack
- Node.js / Express.js
- MongoDB / Mongoose
- JWT Auth (admin, conductor, pasajero)
- WebSocket (tracking real-time)
- Mercado Pago (pagos reales)
- Multer (uploads)
- Helmet, CORS, sanitización y seguridad

---

### Carpeta `/src`
- `api/` - Controladores, rutas y DTOs REST
- `models/` - Modelos de MongoDB/Mongoose
- `services/` - Lógica de negocio y servicios externos
- `middlewares/` - Middlewares globales
- `sockets/` - WebSockets para tracking en tiempo real
- `utils/` - Utilidades generales
- `uploads/` - Archivos subidos

---

## Para contribuir

1. Fork
2. Crea tu rama `feature/xyz`
3. Haz commit por cada feature completada
4. Haz push y PR

---
