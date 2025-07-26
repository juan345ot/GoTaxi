const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

exports.sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    text,
    html
  });
  return info;
};