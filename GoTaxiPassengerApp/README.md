# 🚕 GoTaxi Passenger App

Aplicación móvil desarrollada en React Native (Expo) para pasajeros, parte del ecosistema GoTaxi.

---

## 📲 Funcionalidades

- Login y registro de usuarios
- Solicitud de viaje con mapa, origen/destino y confirmación
- Selección de método de pago: efectivo, tarjeta, Mercado Pago (simulado)
- Seguimiento del viaje y estado en tiempo real
- Chat con el conductor (persistente local)
- Calificación del viaje con sistema de estrellas
- Historial de viajes (filtrado por método de pago y con calificación)
- Edición de perfil (nombre, email, teléfono, avatar estático editable)
- Soporte y reclamos (estado y respuesta simulada)
- Internacionalización (ES/EN)
- UI/UX profesional, modular y escalable

---

## 🧱 Tecnologías principales

- React Native + Expo
- React Navigation (stack + tabs)
- Axios
- i18n-js + expo-localization
- react-native-maps
- react-native-root-toast
- Context API + hooks personalizados
- AsyncStorage para persistencia local

---

## 🗂 Estructura del proyecto

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
npx expo install react-native-maps react-native-safe-area-context \
react-native-screens react-native-gesture-handler react-native-reanimated \
react-native-root-toast @react-navigation/native \
@react-navigation/native-stack @react-navigation/bottom-tabs \
@expo/vector-icons expo-location i18n-js expo-localization \
@react-native-async-storage/async-storage
```

---

## ▶️ Ejecución

```bash
npx expo start
```

---

🧪 Estado actual
✔ Análisis y mejoras exhaustivas por carpeta
✔ Métodos de pago y calificación listos
✔ Estructura profesional y modular
✔ Simulación avanzada de todas las features
✔ Preparada para conectar a backend real y escalar



---

## 🧑‍💻 Autor

Proyecto desarrollado por Juan Scapellato 🚕

---

> **Nota:** esta app forma parte del ecosistema **GoTaxi**, que incluye la app del conductor y el panel admin web.
