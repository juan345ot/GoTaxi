# 📦 CHANGELOG - GoTaxi Passenger App

---

## [1.2.0] - 2025-06-30
### ✨ Refactor total por carpetas
- ✅ `components/`: nuevos componentes reutilizables, íconos, estilos y modularización
- ✅ `screens/`: refactor de todas las vistas, UX/UI mejorado, estructura limpia
- ✅ `hooks/`: separación de lógica, cancelación de viaje, documentación agregada
- ✅ `contexts/`: modularización de auth y ubicación, loading y funciones expuestas
- ✅ `services/`: nuevos servicios simulados (auth, ride, chat, soporte)
- ✅ `utils/`: validadores agrupados, mensajes de error, utilidades de plataforma
- ✅ `navigation/`: rutas separadas, archivos por stack/tab, constantes de navegación
- ✅ `config/`: entorno `dev` y `prod` con constantes compartidas
- ✅ `api/`: interceptores, manejo de errores global y helpers (`get`, `post`, etc.)

---

## [1.1.0] - 2025-06-29
### 🔧 Refactor técnico y mejoras globales
- Refactorizado `MapPreview.js` con props dinámicos y múltiples marcadores
- Agregado componente `ChatInput.js`
- Agregado `BookingConfirmationModal.js` para confirmar viajes
- Agregados hooks: `useLanguage`, `useMap`
- Nuevas utilidades: `toast.js`, `formatDate.js`
- Estilos globales unificados con `theme.js` y `typography.js`

---

## [1.0.0] - 2025-06-27
### 🧱 Versión base funcional
- Flujo completo de pasajero: login, solicitud de viaje, chat, perfil, historial
- Traducción español/inglés
- Mapa, navegación stack + tabs, soporte básico
