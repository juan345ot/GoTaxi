# 🚖 GoTaxi Backend

**Backend profesional para GoTaxi:** plataforma de transporte con apps de pasajero, conductor y panel web admin.

---

## 🔥 Stack principal

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Auth (admin, conductor, pasajero)
- WebSocket (tracking real-time)
- Mercado Pago (pagos reales)
- Multer (uploads)
- Seguridad: Helmet, CORS, sanitización, rate limit, logs
- Test: Jest, Supertest

---

## 📦 Instalación y ejecución

```bash
git clone https://github.com/juan345ot/GoTaxi.git
cd GoTaxi/go-taxi-backend
npm install
cp .env.example .env
npm run dev
