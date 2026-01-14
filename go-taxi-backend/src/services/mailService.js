const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS } = require('../config/env');
const { logToFile } = require('../utils/logger');

/*
 * Servicio de envío de correos.
 *
 * Utiliza Nodemailer y las variables de entorno configuradas en env.js para
 * host, puerto, usuario, contraseña y uso de TLS/SSL. Admite un nombre
 * personalizado en la cabecera 'from' mediante EMAIL_FROM_NAME; si no está
 * definido, se usa simplemente el correo del remitente.
 */

const defaultFromName = process.env.EMAIL_FROM_NAME;
const defaultFrom = defaultFromName ? `${defaultFromName} <${EMAIL_USER}>` : EMAIL_USER;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE, // true para 465, false para otros puertos
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.sendMail = async ({ to, subject, text, html, from = defaultFrom }) => {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (err) {
    // Loguear y adjuntar información para que el controlador lo maneje
    logToFile(`Error enviando email a ${to}: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MAIL_SEND_FAILED';
    err.details = err.details || { to, subject };
    throw err;
  }
};
