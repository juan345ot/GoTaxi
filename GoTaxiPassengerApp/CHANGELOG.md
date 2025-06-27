# 📦 CHANGELOG - GoTaxi Passenger App

Todas las modificaciones relevantes al proyecto se documentan en este archivo.

---

## [1.1.0] - 2025-06-29
### 🔧 Refactor técnico y mejoras globales
- Refactorizado `MapPreview.js` con props dinámicos y múltiples marcadores
- Agregado componente reutilizable `ChatInput.js`
- Agregado modal `BookingConfirmationModal.js` para confirmar viajes
- Creado `LanguageContext.js` para cambio dinámico de idioma
- Agregados hooks: `useLanguage`, `useMap`
- Nuevas utilidades: `toast.js`, `formatDate.js`
- Estilos globales unificados con `theme.js` y `typography.js`

---

## [1.0.0] - 2025-06-27
### 🧱 Versión base funcional
- Arquitectura inicial modular por dominio
- Flujo de autenticación (login/register)
- Solicitud y seguimiento de viajes con mapa
- Chat básico entre pasajero y conductor
- Historial de viajes
- Perfil editable con selector de idioma
- Traducciones `es` / `en`
- Navegación stack + tabs integrada
