# Carpeta `config/`

Centraliza toda la configuración, constantes y enumeraciones del backend GoTaxi.

## Archivos

- **`roles.js`**: define los roles válidos del sistema (admin, conductor,
  pasajero) de forma inmutable mediante `Object.freeze`.
- **`constants.js`**: contiene las enumeraciones de estados de viajes, métodos y
  estados de pago, y tipos de configuraciones. Todas las constantes son
  inmutables.
- **`env.js`**: expone de manera centralizada las variables de entorno de la
  aplicación. Incluye ahora valores por defecto para el puerto, expiración JWT,
  configuración del correo (`EMAIL_PORT` y `EMAIL_SECURE`) y garantiza la
  conversión de cadenas a números donde corresponde.

Mantener estas constantes en un único lugar facilita el mantenimiento y reduce
la duplicación de cadenas mágicas en el código.
