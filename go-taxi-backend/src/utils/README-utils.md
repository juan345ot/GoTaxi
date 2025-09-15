# Carpeta `utils/`

Utilidades generales y helpers reutilizables del backend GoTaxi.

## Archivos

- **`logger.js`**: proporciona la función `logToFile(message)` que escribe
  mensajes en un archivo de log. La ubicación del directorio y el nombre
  del archivo pueden configurarse mediante las variables de entorno
  `LOG_DIR` y `LOG_FILE`; si no se definen, se utiliza `./logs/app.log`.
  Cada entrada de log incluye un timestamp en formato `YYYY-MM-DD HH:mm:ss`.
- **`helpers.js`**: incluye utilidades sencillas:
  - `randomCode(length)`: genera un código alfanumérico aleatorio de
    longitud fija empleando `crypto.randomBytes` para mayor entropía. El
    resultado siempre está en mayúsculas.
  - `normalizeEmail(email)`: convierte una dirección de correo a minúsculas
    y elimina espacios en blanco al inicio y al final.
- **`date.js`**: expone `formatDate(date)` para formatear fechas en el
  patrón `YYYY-MM-DD HH:mm:ss` usando `toISOString()`. Si necesitas
  ajustar a la zona horaria local, revisa los comentarios dentro del
  archivo para usar `Intl.DateTimeFormat`.

## Uso

Estas utilidades pueden importarse en cualquier parte del proyecto.
Por ejemplo, para registrar eventos en un archivo de log:

```js
const { logToFile } = require('../utils/logger');

logToFile('Usuario Juan se registró como conductor');
