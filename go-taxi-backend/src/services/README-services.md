# Carpeta `services/`

En esta carpeta se centralizan las integraciones con servicios externos usados
por el backend de GoTaxi.

## Archivos

- **`mercadoPagoService.js`**: integra con la API de Mercado Pago para crear
  preferencias de pago y consultar estados. Se configuran las credenciales de
  acceso a través de variables de entorno (`MP_ACCESS_TOKEN` y `BASE_URL`). Los
  errores durante las solicitudes se registran con `logToFile` y se vuelven a
  lanzar con códigos coherentes (`MP_CREATE_PREFERENCE_FAILED`,
  `MP_GET_PAYMENT_FAILED`).

- **`mailService.js`**: envía correos utilizando Nodemailer. Lee la
  configuración desde las variables de entorno (`EMAIL_HOST`, `EMAIL_PORT`,
  `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`). Permite definir un nombre
  personalizado del remitente mediante `EMAIL_FROM_NAME`. Los errores en el
  envío quedan registrados y se propagan con el código `MAIL_SEND_FAILED`.

- **`notificationService.js`**: placeholder para futuras integraciones de
  notificaciones push y WhatsApp. Actualmente registra las llamadas mediante
  `logToFile` y devuelve una respuesta informando que la funcionalidad no está
  implementada.

Al añadir nuevas integraciones (p. ej., SMS, Apple Push, WebPush), se recomienda
seguir el mismo patrón de captura de excepciones y uso de `logToFile` para
trazabilidad.
