# GoTaxi Passenger App

Aplicación móvil para pasajeros de GoTaxi, desarrollada en React Native con Expo.

---

## 🚀 Funcionalidades

- Autenticación: login, registro, cierre de sesión
- Solicitud de viaje con origen y destino
- Seguimiento de viaje con mapa
- Historial de viajes
- Perfil del pasajero
- Chat con el conductor
- Soporte integrado
- Multilenguaje (español e inglés)

---

## 📁 Estructura del proyecto

```
GoTaxiPassengerApp/
├── assets/               # Imágenes, íconos y fuentes
├── src/
│   ├── api/             # Cliente HTTP
│   ├── components/      # Componentes UI comunes y específicos
│   ├── config/          # Configuración de entornos
│   ├── contexts/        # Contextos globales (auth, ubicación)
│   ├── hooks/           # Hooks personalizados
│   ├── navigation/      # Navegación principal
│   ├── screens/         # Pantallas por dominio
│   ├── services/        # Servicios y lógica externa
│   ├── styles/          # Estilos globales
│   ├── translations/    # i18n
│   └── utils/           # Validadores y helpers
```

---

## 🧱 Tecnologías usadas

- React Native + Expo
- React Navigation (stack + bottom-tabs)
- Context API
- Axios
- i18n-js + expo-localization
- react-native-maps *(para mapa en RideTracking)*

---

## 📦 Instalación

```bash
npm install
npx expo install
```

Instalá también las siguientes dependencias cuando ejecutes por primera vez:

```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-vector-icons i18n-js expo-localization expo-location react-native-maps
```

---

## ▶️ Ejecución

```bash
npx expo start
```

---

## ✅ To-Do

- Conectar con backend real
- WebSocket para chat en tiempo real
- Integración con pasarela de pagos
- Validaciones más robustas y alertas globales

---

## 🧑‍💻 Autor

Proyecto desarrollado por Juan Scapellato 🚕

---

> **Nota:** esta app forma parte del ecosistema **GoTaxi**, que incluye la app del conductor y el panel admin web.
