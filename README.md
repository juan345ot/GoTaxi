# 🚕 GoTaxi - Plataforma de Transporte Urbano

![GoTaxi Logo](https://img.shields.io/badge/GoTaxi-Transporte%20Urbano-blue?style=for-the-badge&logo=car)

Una plataforma completa de transporte urbano que conecta pasajeros con conductores de taxi, incluyendo aplicaciones móviles, panel de administración y backend robusto.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Licencia](#-licencia)

## ✨ Características

### 🚗 Para Pasajeros

- **Registro y autenticación segura** con validación robusta y protección XSS
- **Almacenamiento seguro** con encriptación AES-256-CBC y rotación de claves
- **Solicitud de viajes** en tiempo real con geolocalización y debouncing
- **Seguimiento en vivo** del conductor y vehículo con optimización de rendimiento
- **Chat integrado** con el conductor y notificaciones push
- **Múltiples métodos de pago** (efectivo, Mercado Pago, tarjeta)
- **Sistema de calificaciones** y comentarios con validación avanzada
- **Historial de viajes** con filtros avanzados y paginación optimizada
- **Soporte multiidioma** (Español/Inglés) con contexto optimizado
- **Modo offline** con sincronización automática
- **Optimización de rendimiento** con React.memo, useCallback y lazy loading

### 🚕 Para Conductores

- **Registro y verificación** de documentos
- **Aceptación de viajes** en tiempo real
- **Navegación integrada** con mapas
- **Gestión de perfil** y vehículo
- **Historial de viajes** y ganancias
- **Sistema de notificaciones** push
- **Chat con pasajeros**

### 👨‍💼 Para Administradores

- **Panel de control** completo con métricas en tiempo real
- **Gestión de usuarios** (pasajeros y conductores) con validación avanzada
- **Monitoreo de viajes** en tiempo real con WebSockets optimizados
- **Métricas y reportes** detallados con caché Redis distribuido
- **Gestión de tarifas** dinámicas con validación de transiciones de estado
- **Sistema de quejas** y soporte con auditoría completa
- **Auditoría de seguridad** completa con logging estructurado
- **Machine State** para gestión robusta de estados de viaje
- **Rate Limiting** avanzado y protección contra ataques

## 🏗️ Arquitectura

### Backend (go-taxi-backend)

```
src/
├── api/                 # Controladores y rutas
│   ├── controllers/     # Lógica de presentación
│   ├── routes/         # Definición de endpoints
│   └── dtos/           # Data Transfer Objects
├── business/           # Lógica de negocio
│   ├── services/       # Servicios de negocio
│   └── entities/       # Entidades de dominio
├── data/              # Acceso a datos
│   ├── repositories/   # Repositorios de datos
│   └── models/        # Modelos de MongoDB
├── config/            # Configuración
├── middlewares/       # Middlewares de Express
├── services/          # Servicios externos
└── utils/             # Utilidades
```

### Frontend Mobile (GoTaxiPassengerApp)

```
src/
├── components/         # Componentes reutilizables
├── screens/           # Pantallas de la aplicación
├── navigation/        # Configuración de navegación
├── contexts/          # Context API para estado global
├── hooks/             # Hooks personalizados
├── services/          # Servicios de negocio
├── infrastructure/    # Repositorios y APIs
├── domain/            # Entidades de dominio
└── utils/             # Utilidades y helpers
```

### Panel Admin (go-taxi-admin-web)

```
src/
├── components/         # Componentes React
├── pages/             # Páginas del panel
├── api/               # Cliente API
├── contexts/          # Context API
└── hooks/             # Hooks personalizados
```

## 🛠️ Tecnologías

### Backend

- **Node.js** + **Express.js** - Servidor web con arquitectura hexagonal
- **MongoDB** + **Mongoose** - Base de datos con índices optimizados
- **JWT** + **Refresh Tokens** - Autenticación segura con rotación
- **WebSocket** - Comunicación en tiempo real optimizada
- **Redis** - Caché distribuido y sesiones
- **Mercado Pago** - Pagos integrados
- **Jest** + **Supertest** - Testing con cobertura completa
- **Helmet** + **CORS** + **Rate Limiting** - Seguridad avanzada
- **Machine State** - Gestión robusta de estados
- **Response Helpers** - Respuestas API estandarizadas

### Frontend Mobile

- **React Native** + **Expo** - Aplicación móvil con optimizaciones
- **React Navigation** - Navegación con lazy loading
- **React Native Maps** - Mapas con debouncing y caché
- **SecureStorage** - Almacenamiento seguro con encriptación AES-256-CBC
- **Axios** - Cliente HTTP con interceptores y retry logic
- **i18n-js** - Internacionalización con contexto optimizado
- **React.memo** + **useCallback** - Optimización de rendimiento
- **Context Selectors** - Gestión de estado optimizada
- **Offline-First** - Funcionalidad offline con sincronización

### Panel Admin

- **React** + **Vite** - Aplicación web
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **React Router** - Navegación

## 🚀 Mejoras Implementadas

### 🔒 Seguridad Avanzada

- **Almacenamiento seguro** con encriptación AES-256-CBC, IV único y rotación automática de claves
- **Protección XSS** con sanitización de datos y detección de patrones maliciosos
- **Content Security Policy** (CSP) configurable para prevenir ataques
- **Validación robusta** de inputs con reglas personalizables
- **Rate Limiting** avanzado por IP y usuario
- **JWT Rotation** con refresh tokens seguros

### ⚡ Optimización de Rendimiento

- **Code Splitting** y lazy loading para reducir el bundle inicial
- **React.memo** y hooks optimizados para prevenir re-renders innecesarios
- **Context Selectors** para suscripción granular al estado
- **Caché inteligente** con TTL dinámico y estrategias de invalidación
- **Debouncing** en geolocalización y búsquedas
- **Paginación cursor-based** para consultas eficientes

### 🏗️ Arquitectura Mejorada

- **Arquitectura Hexagonal** en el backend para mejor separación de responsabilidades
- **Machine State** para gestión robusta de estados de viaje
- **Response Helpers** para estandarizar respuestas de API
- **Repository Pattern** con consultas optimizadas y agregaciones
- **Service Layer** con lógica de negocio centralizada

### 📱 Experiencia de Usuario

- **Modo Offline** con sincronización automática cuando se recupera la conexión
- **Retry Logic** inteligente para operaciones fallidas
- **Loading States** optimizados y feedback visual mejorado
- **Validación en tiempo real** con mensajes de error contextuales
- **Internacionalización** completa con soporte para múltiples idiomas

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- MongoDB 5+
- npm o yarn
- Expo CLI (para mobile)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/gotaxi.git
cd gotaxi
```

### 2. Instalar dependencias del backend

```bash
cd go-taxi-backend
npm install
```

### 3. Instalar dependencias del frontend mobile

```bash
cd ../GoTaxiPassengerApp
npm install
```

### 4. Instalar dependencias del panel admin

```bash
cd ../go-taxi-admin-web
npm install
```

## ⚙️ Configuración

### Backend

1. Copiar el archivo de configuración:

```bash
cd go-taxi-backend
cp .env.example .env
```

2. Configurar variables de entorno:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gotaxi
JWT_SECRET=tu-jwt-secret-super-seguro
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key
```

3. Iniciar MongoDB:

```bash
mongod
```

4. Ejecutar migraciones (si las hay):

```bash
npm run migrate
```

5. Iniciar el servidor:

```bash
npm run dev
```

### Frontend Mobile

1. Configurar variables de entorno:

```bash
cd GoTaxiPassengerApp
cp .env.example .env
```

2. Configurar la URL del backend en `.env`:

```env
API_URL=http://localhost:3000
```

3. Iniciar la aplicación:

```bash
npm start
```

### Panel Admin

1. Configurar variables de entorno:

```bash
cd go-taxi-admin-web
cp .env.example .env
```

2. Configurar la URL del backend en `.env`:

```env
VITE_API_URL=http://localhost:3000
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## 📚 API Documentation

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/refresh` - Renovar token

### Viajes

- `POST /api/trips/request` - Solicitar viaje
- `GET /api/trips/:id` - Obtener viaje
- `PUT /api/trips/:id/cancel` - Cancelar viaje
- `POST /api/trips/:id/pay` - Pagar viaje
- `POST /api/trips/:id/rate` - Calificar viaje

### Usuarios

- `GET /api/users/profile` - Perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/avatar` - Subir avatar
- `PUT /api/users/password` - Cambiar contraseña

### Administración

- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/trips` - Listar viajes
- `GET /api/admin/metrics` - Métricas del sistema
- `GET /api/admin/complaints` - Listar quejas

Para documentación completa de la API, ver [API Documentation](./docs/API.md)

## 🧪 Testing

### Backend

```bash
cd go-taxi-backend
npm test                 # Ejecutar todos los tests
npm run test:watch      # Modo watch
npm run test:coverage   # Con cobertura
```

### Frontend Mobile

```bash
cd GoTaxiPassengerApp
npm test                 # Ejecutar todos los tests
npm run test:watch      # Modo watch
npm run test:coverage   # Con cobertura
```

### Panel Admin

```bash
cd go-taxi-admin-web
npm test                 # Ejecutar todos los tests
npm run test:watch      # Modo watch
npm run test:coverage   # Con cobertura
```

## 🚀 Deployment

### Backend (Heroku/Railway/DigitalOcean)

1. Configurar variables de entorno en el proveedor
2. Conectar repositorio
3. Configurar build command: `npm install && npm run build`
4. Configurar start command: `npm start`

### Frontend Mobile (Expo)

1. Configurar Expo:

```bash
cd GoTaxiPassengerApp
expo login
expo build:android
expo build:ios
```

2. Subir a Google Play Store / App Store

### Panel Admin (Vercel/Netlify)

1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar publish directory: `dist`

## 🤝 Contributing

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Guías de Contribución

- [Código de Conducta](./docs/CODE_OF_CONDUCT.md)
- [Guía de Contribución](./docs/CONTRIBUTING.md)
- [Estándares de Código](./docs/CODING_STANDARDS.md)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Email**: soporte@gotaxi.com
- **Discord**: [Servidor de GoTaxi](https://discord.gg/gotaxi)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/gotaxi/issues)

## 🙏 Agradecimientos

- [React Native](https://reactnative.dev/) - Framework móvil
- [Expo](https://expo.dev/) - Plataforma de desarrollo
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [Mercado Pago](https://www.mercadopago.com.ar/) - Pagos
- [React](https://reactjs.org/) - Framework web

---

<div align="center">
  <p>Hecho con ❤️ por el equipo de GoTaxi</p>
  <p>© 2024 GoTaxi. Todos los derechos reservados.</p>
</div>
