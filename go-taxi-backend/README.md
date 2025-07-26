# 🚖 GoTaxi Backend

Backend robusto y seguro para la plataforma GoTaxi.

## Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Auth (roles: admin, conductor, pasajero)
- WebSocket tracking en tiempo real
- Seguridad PRO: CORS, Helmet, Sanitización, Rate Limit, Logs
- Mercado Pago (pagos reales)
- Multer (uploads)
- Tests automáticos (Jest/Supertest)

## Instalación

git clone https://github.com/juan345ot/GoTaxi.git
cd GoTaxi/go-taxi-backend
npm install
cp .env.example .env
npm run dev

##  Estructura principal

-src/config — configuración y enums

-src/middlewares — middlewares de seguridad, logger, uploads, etc.

-src/models — modelos Mongoose

-src/utils — utilidades (logger, helpers)

-src/services — integraciones externas (Mercado Pago, email, notificaciones)

-src/sockets — lógica WebSocket

-src/api — controladores, rutas, dtos

-src/uploads — archivos subidos (no se suben a git)

-logs/ — logs de la app (no se suben a git)

## Endpoints principales (ver /api/)

## WebSocket

Conexión por /ws

Tracking de ubicación, estado de viaje, SOS y eventos en tiempo real

## Contribuir

Forkea el repo

Trabaja en una rama feature/lo-que-hagas

Haz commits claros y frecuentes

Pull request cuando termines