# 📚 Documentación de API - GoTaxi

## 📋 Tabla de Contenidos

- [Información General](#-información-general)
- [Autenticación](#-autenticación)
- [Endpoints de Usuario](#-endpoints-de-usuario)
- [Endpoints de Viajes](#-endpoints-de-viajes)
- [Endpoints de Pagos](#-endpoints-de-pagos)
- [Endpoints de Administración](#-endpoints-de-administración)
- [Códigos de Error](#-códigos-de-error)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Colección Postman](#-colección-postman)

## ℹ️ Información General

### Base URL

```
Desarrollo: http://localhost:3000
Producción: https://api.gotaxi.com
```

### Versión

```
v1.0.0
```

### Formato de Respuesta

Todas las respuestas siguen el formato estándar:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "meta": {
    "timestamp": "2024-12-19T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Headers Requeridos

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

## 🔐 Autenticación

### POST /api/auth/register

Registra un nuevo usuario en el sistema.

**Request Body:**

```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+5491123456789",
  "role": "pasajero"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Juan",
      "lastname": "Pérez",
      "email": "juan@example.com",
      "phone": "+5491123456789",
      "role": "pasajero",
      "isActive": true,
      "createdAt": "2024-12-19T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  },
  "message": "Usuario registrado exitosamente"
}
```

### POST /api/auth/login

Inicia sesión de un usuario existente.

**Request Body:**

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Juan",
      "lastname": "Pérez",
      "email": "juan@example.com",
      "role": "pasajero"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  },
  "message": "Login exitoso"
}
```

### POST /api/auth/refresh

Renueva el token de acceso usando el refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Token renovado exitosamente"
}
```

### POST /api/auth/logout

Cierra la sesión del usuario.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

## 👤 Endpoints de Usuario

### GET /api/users/profile

Obtiene el perfil del usuario autenticado.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@example.com",
    "phone": "+5491123456789",
    "role": "pasajero",
    "avatar": "https://api.gotaxi.com/uploads/avatar.jpg",
    "isActive": true,
    "createdAt": "2024-12-19T10:30:00Z",
    "updatedAt": "2024-12-19T10:30:00Z"
  }
}
```

### PUT /api/users/profile

Actualiza el perfil del usuario autenticado.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "Juan Carlos",
  "lastname": "Pérez",
  "phone": "+5491123456789"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Carlos",
    "lastname": "Pérez",
    "email": "juan@example.com",
    "phone": "+5491123456789",
    "role": "pasajero",
    "updatedAt": "2024-12-19T11:00:00Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

### PUT /api/users/password

Cambia la contraseña del usuario autenticado.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### POST /api/users/avatar

Sube un avatar para el usuario.

**Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
avatar: [archivo de imagen]
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://api.gotaxi.com/uploads/avatar_123456789.jpg"
  },
  "message": "Avatar actualizado exitosamente"
}
```

## 🚗 Endpoints de Viajes

### POST /api/trips/request

Solicita un nuevo viaje.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "origin": {
    "address": "Av. Corrientes 1234, Buenos Aires",
    "latitude": -34.6037,
    "longitude": -58.3816
  },
  "destination": {
    "address": "Plaza de Mayo, Buenos Aires",
    "latitude": -34.6083,
    "longitude": -58.3712
  },
  "paymentMethod": "efectivo"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "passengerId": "507f1f77bcf86cd799439011",
    "origin": {
      "address": "Av. Corrientes 1234, Buenos Aires",
      "latitude": -34.6037,
      "longitude": -58.3816
    },
    "destination": {
      "address": "Plaza de Mayo, Buenos Aires",
      "latitude": -34.6083,
      "longitude": -58.3712
    },
    "status": "requested",
    "fare": 250.5,
    "distance": 2.5,
    "duration": 15,
    "paymentMethod": "efectivo",
    "createdAt": "2024-12-19T10:30:00Z"
  },
  "message": "Viaje solicitado exitosamente"
}
```

### GET /api/trips/:id

Obtiene un viaje específico por ID.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "passengerId": "507f1f77bcf86cd799439011",
    "driverId": "507f1f77bcf86cd799439013",
    "origin": {
      "address": "Av. Corrientes 1234, Buenos Aires",
      "latitude": -34.6037,
      "longitude": -58.3816
    },
    "destination": {
      "address": "Plaza de Mayo, Buenos Aires",
      "latitude": -34.6083,
      "longitude": -58.3712
    },
    "status": "in_progress",
    "fare": 250.5,
    "distance": 2.5,
    "duration": 15,
    "paymentMethod": "efectivo",
    "driver": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Carlos",
      "lastname": "González",
      "phone": "+5491123456789",
      "rating": 4.8,
      "vehicle": {
        "brand": "Toyota",
        "model": "Corolla",
        "color": "Blanco",
        "licensePlate": "ABC123"
      }
    },
    "createdAt": "2024-12-19T10:30:00Z",
    "updatedAt": "2024-12-19T10:45:00Z"
  }
}
```

### PUT /api/trips/:id/cancel

Cancela un viaje existente.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "reason": "Cambio de planes"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "cancelled",
    "cancelledAt": "2024-12-19T10:35:00Z",
    "cancellationReason": "Cambio de planes"
  },
  "message": "Viaje cancelado exitosamente"
}
```

### GET /api/trips/user

Obtiene los viajes del usuario autenticado.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `status` (opcional): Filtrar por estado

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "origin": {
        "address": "Av. Corrientes 1234, Buenos Aires"
      },
      "destination": {
        "address": "Plaza de Mayo, Buenos Aires"
      },
      "status": "completed",
      "fare": 250.5,
      "createdAt": "2024-12-19T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /api/trips/:id/rate

Califica un viaje completado.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Excelente servicio, muy puntual"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Viaje calificado exitosamente"
}
```

## 💳 Endpoints de Pagos

### POST /api/payments/process

Procesa un pago para un viaje.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "tripId": "507f1f77bcf86cd799439012",
  "paymentMethod": "mercadopago",
  "amount": 250.5,
  "paymentData": {
    "cardToken": "card_token_123456789"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123456789",
    "status": "approved",
    "amount": 250.5,
    "paymentMethod": "mercadopago",
    "transactionId": "txn_123456789",
    "processedAt": "2024-12-19T11:00:00Z"
  },
  "message": "Pago procesado exitosamente"
}
```

### GET /api/payments/methods

Obtiene los métodos de pago disponibles.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "efectivo",
      "name": "Efectivo",
      "description": "Pago en efectivo al conductor",
      "available": true
    },
    {
      "id": "mercadopago",
      "name": "Mercado Pago",
      "description": "Pago con tarjeta a través de Mercado Pago",
      "available": true
    }
  ]
}
```

## 👨‍💼 Endpoints de Administración

### GET /api/admin/users

Obtiene la lista de usuarios (requiere rol admin).

**Headers:**

```http
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página
- `role` (opcional): Filtrar por rol
- `status` (opcional): Filtrar por estado

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Juan",
      "lastname": "Pérez",
      "email": "juan@example.com",
      "role": "pasajero",
      "isActive": true,
      "createdAt": "2024-12-19T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

### GET /api/admin/trips

Obtiene la lista de viajes (requiere rol admin).

**Headers:**

```http
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página
- `status` (opcional): Filtrar por estado
- `dateFrom` (opcional): Fecha desde (ISO 8601)
- `dateTo` (opcional): Fecha hasta (ISO 8601)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "passenger": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Juan",
        "lastname": "Pérez"
      },
      "driver": {
        "id": "507f1f77bcf86cd799439013",
        "name": "Carlos",
        "lastname": "González"
      },
      "origin": {
        "address": "Av. Corrientes 1234, Buenos Aires"
      },
      "destination": {
        "address": "Plaza de Mayo, Buenos Aires"
      },
      "status": "completed",
      "fare": 250.5,
      "createdAt": "2024-12-19T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 500,
      "pages": 50
    }
  }
}
```

### GET /api/admin/metrics

Obtiene métricas del sistema (requiere rol admin).

**Headers:**

```http
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1500,
      "passengers": 1200,
      "drivers": 250,
      "admins": 5,
      "active": 1400
    },
    "trips": {
      "total": 5000,
      "completed": 4800,
      "cancelled": 150,
      "inProgress": 50,
      "totalRevenue": 125000.5
    },
    "system": {
      "uptime": "7d 12h 30m",
      "responseTime": 150,
      "errorRate": 0.02
    }
  }
}
```

## ❌ Códigos de Error

### 400 - Bad Request

```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "El email es requerido",
    "password": "La contraseña debe tener al menos 6 caracteres"
  }
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "error": "Token de autenticación inválido o expirado",
  "code": "UNAUTHORIZED"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "error": "No tienes permisos para realizar esta acción",
  "code": "FORBIDDEN"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "error": "Viaje no encontrado",
  "code": "NOT_FOUND"
}
```

### 409 - Conflict

```json
{
  "success": false,
  "error": "El email ya está registrado",
  "code": "CONFLICT"
}
```

### 429 - Too Many Requests

```json
{
  "success": false,
  "error": "Demasiadas solicitudes. Intenta nuevamente en 15 minutos",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "code": "INTERNAL_ERROR"
}
```

## 📝 Ejemplos de Uso

### Flujo Completo de Viaje

1. **Registro de Usuario**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "+5491123456789",
    "role": "pasajero"
  }'
```

2. **Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

3. **Solicitar Viaje**

```bash
curl -X POST http://localhost:3000/api/trips/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "origin": {
      "address": "Av. Corrientes 1234, Buenos Aires",
      "latitude": -34.6037,
      "longitude": -58.3816
    },
    "destination": {
      "address": "Plaza de Mayo, Buenos Aires",
      "latitude": -34.6083,
      "longitude": -58.3712
    },
    "paymentMethod": "efectivo"
  }'
```

4. **Calificar Viaje**

```bash
curl -X POST http://localhost:3000/api/trips/507f1f77bcf86cd799439012/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "rating": 5,
    "comment": "Excelente servicio"
  }'
```

## 📦 Colección Postman

### Importar Colección

1. Descarga el archivo `GoTaxi-API.postman_collection.json`
2. Abre Postman
3. Click en "Import"
4. Selecciona el archivo descargado
5. La colección se importará con todos los endpoints configurados

### Variables de Entorno

Configura las siguientes variables en Postman:

```
base_url: http://localhost:3000
access_token: {{jwt_token}}
refresh_token: {{refresh_token}}
user_id: {{user_id}}
trip_id: {{trip_id}}
```

### Autenticación Automática

La colección incluye scripts de pre-request que:

- Automáticamente renuevan tokens expirados
- Guardan tokens en variables de entorno
- Manejan errores de autenticación

---

<div align="center">
  <p>📚 Esta documentación se actualiza con cada nueva versión de la API</p>
  <p>🔄 Última actualización: Diciembre 2024</p>
  <p>📧 Para soporte: api-support@gotaxi.com</p>
</div>
