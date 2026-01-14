# ⚙️ Configuración de Entorno - GoTaxi

Esta guía te ayudará a configurar tu entorno de desarrollo para contribuir a GoTaxi.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#-prerrequisitos)
- [Configuración Inicial](#-configuración-inicial)
- [Backend Setup](#-backend-setup)
- [Frontend Mobile Setup](#-frontend-mobile-setup)
- [Panel Admin Setup](#-panel-admin-setup)
- [Base de Datos](#-base-de-datos)
- [Servicios Externos](#-servicios-externos)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

## 🔧 Prerrequisitos

### Software Requerido

- **Node.js** 18+ - [Descargar](https://nodejs.org/)
- **MongoDB** 5+ - [Descargar](https://www.mongodb.com/try/download/community)
- **Git** - [Descargar](https://git-scm.com/)
- **Expo CLI** - Para desarrollo móvil
- **VS Code** (recomendado) - [Descargar](https://code.visualstudio.com/)

### Herramientas Opcionales

- **MongoDB Compass** - GUI para MongoDB
- **Postman** - Para testing de API
- **React Native Debugger** - Para debugging móvil
- **Docker** - Para containerización

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gotaxi.git
cd gotaxi

# Configurar remote upstream
git remote add upstream https://github.com/original-usuario/gotaxi.git
```

### 2. Instalar Dependencias Globales

```bash
# Instalar Expo CLI
npm install -g @expo/cli

# Instalar herramientas de desarrollo
npm install -g nodemon
npm install -g jest
npm install -g eslint
npm install -g prettier
```

## 🖥️ Backend Setup

### 1. Instalar Dependencias

```bash
cd go-taxi-backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Entorno
NODE_ENV=development
PORT=3000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/gotaxi_dev

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro-aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=tu-public-key-aqui
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret-aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

### 3. Iniciar MongoDB

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# o
brew services start mongodb-community
```

### 4. Ejecutar Migraciones (si las hay)

```bash
npm run migrate
```

### 5. Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Con debugging
npm run dev:debug
```

### 6. Verificar Instalación

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3000/api/health

# Debería retornar:
# {"status":"ok","timestamp":"2024-01-15T10:30:00Z"}
```

## 📱 Frontend Mobile Setup

### 1. Instalar Dependencias

```bash
cd GoTaxiPassengerApp
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env`:

```env
# API Backend
API_URL=http://localhost:3000
API_TIMEOUT=15000

# Google Maps (opcional)
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key

# Push Notifications (opcional)
EXPO_PUSH_TOKEN=tu-expo-push-token

# Debug
DEBUG=true
```

### 3. Configurar Expo

```bash
# Iniciar sesión en Expo
expo login

# Configurar proyecto
expo install
```

### 4. Iniciar la Aplicación

```bash
# Iniciar Metro bundler
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

### 5. Verificar Instalación

- La aplicación debería abrirse en tu dispositivo/emulador
- Deberías ver la pantalla de login
- Los logs deberían aparecer en la terminal

## 🌐 Panel Admin Setup

### 1. Instalar Dependencias

```bash
cd go-taxi-admin-web
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env`:

```env
# API Backend
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=15000

# App Info
VITE_APP_NAME=GoTaxi Admin
VITE_APP_VERSION=1.0.0

# Debug
VITE_DEBUG=true
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 4. Verificar Instalación

- Abrir http://localhost:5173 en el navegador
- Deberías ver el panel de administración
- Los logs deberían aparecer en la terminal

## 🗄️ Base de Datos

### MongoDB Setup

#### 1. Instalar MongoDB

**Windows:**

```bash
# Descargar desde https://www.mongodb.com/try/download/community
# Instalar con el instalador
```

**macOS:**

```bash
# Con Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu):**

```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crear archivo de lista
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### 2. Iniciar MongoDB

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### 3. Crear Base de Datos

```bash
# Conectar a MongoDB
mongo

# Crear base de datos
use gotaxi_dev

# Crear usuario (opcional)
db.createUser({
  user: "gotaxi_user",
  pwd: "gotaxi_password",
  roles: ["readWrite"]
})
```

#### 4. Verificar Conexión

```bash
# Verificar que MongoDB esté corriendo
mongo --eval "db.adminCommand('ismaster')"

# Debería retornar información del servidor
```

### Redis Setup (Opcional)

#### 1. Instalar Redis

**Windows:**

```bash
# Descargar desde https://github.com/microsoftarchive/redis/releases
# Instalar con el instalador
```

**macOS:**

```bash
brew install redis
```

**Linux:**

```bash
sudo apt-get install redis-server
```

#### 2. Iniciar Redis

```bash
# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

#### 3. Verificar Conexión

```bash
# Conectar a Redis
redis-cli

# Probar conexión
ping
# Debería retornar: PONG
```

## 🔌 Servicios Externos

### Google Maps API

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar la API de Maps JavaScript
4. Crear credenciales (API Key)
5. Configurar restricciones de dominio/IP
6. Agregar la API Key a las variables de entorno

### Mercado Pago

1. Crear cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crear una aplicación
3. Obtener Access Token y Public Key
4. Configurar webhooks para notificaciones
5. Agregar las credenciales a las variables de entorno

### Expo Push Notifications

1. Instalar Expo CLI: `npm install -g @expo/cli`
2. Iniciar sesión: `expo login`
3. Configurar proyecto: `expo install expo-notifications`
4. Obtener push token para notificaciones

## 🧪 Testing

### Backend Tests

```bash
cd go-taxi-backend

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests específicos
npm test -- --testNamePattern="AuthService"
```

### Frontend Mobile Tests

```bash
cd GoTaxiPassengerApp

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Panel Admin Tests

```bash
cd go-taxi-admin-web

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a MongoDB

```bash
# Verificar que MongoDB esté corriendo
ps aux | grep mongod

# Verificar puerto
netstat -an | grep 27017

# Reiniciar MongoDB
sudo systemctl restart mongod
```

#### 2. Error de Puerto en Uso

```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

#### 3. Error de Dependencias

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 4. Error de Expo

```bash
# Limpiar cache de Expo
expo r -c

# Reiniciar Metro bundler
npm start -- --reset-cache
```

#### 5. Error de Permisos

```bash
# Cambiar permisos de archivos
chmod +x scripts/*.sh

# Cambiar propietario de archivos
sudo chown -R $USER:$USER .
```

### Logs y Debugging

#### Backend Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver logs de error
grep "ERROR" logs/app.log

# Ver logs de debug
grep "DEBUG" logs/app.log
```

#### Frontend Logs

```bash
# Ver logs de React Native
npx react-native log-android
npx react-native log-ios

# Ver logs de Expo
expo logs
```

#### Database Logs

```bash
# Ver logs de MongoDB
tail -f /var/log/mongodb/mongod.log

# Ver logs de Redis
tail -f /var/log/redis/redis-server.log
```

### Performance Issues

#### 1. Slow Database Queries

```bash
# Habilitar profiling en MongoDB
db.setProfilingLevel(2, { slowms: 100 })

# Ver queries lentas
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

#### 2. Memory Issues

```bash
# Ver uso de memoria
free -h

# Ver procesos usando más memoria
ps aux --sort=-%mem | head -10
```

#### 3. Network Issues

```bash
# Verificar conectividad
ping google.com

# Verificar DNS
nslookup google.com

# Verificar puertos
netstat -tulpn | grep :3000
```

## 📚 Recursos Adicionales

### Documentación Oficial

- [Node.js](https://nodejs.org/docs/)
- [MongoDB](https://docs.mongodb.com/)
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Express.js](https://expressjs.com/)

### Herramientas de Desarrollo

- [VS Code Extensions](./VSCODE_EXTENSIONS.md)
- [Postman Collection](./postman/GoTaxi-API.postman_collection.json)
- [Docker Compose](./docker-compose.yml)

### Comunidad

- [Discord](https://discord.gg/gotaxi)
- [GitHub Discussions](https://github.com/tu-usuario/gotaxi/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/gotaxi)

---

Si encuentras algún problema que no esté cubierto en esta guía, por favor:

1. Revisa los [Issues existentes](https://github.com/tu-usuario/gotaxi/issues)
2. Busca en [GitHub Discussions](https://github.com/tu-usuario/gotaxi/discussions)
3. Pregunta en [Discord](https://discord.gg/gotaxi)
4. Crea un nuevo issue con detalles del problema

¡Feliz coding! 🚕✨
