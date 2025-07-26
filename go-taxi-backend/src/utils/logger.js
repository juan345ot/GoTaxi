const fs = require('fs');
const path = require('path');

function logToFile(message) {
  const logPath = path.join(__dirname, '../logs/app.log');
  const logMsg = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logPath, logMsg, err => {
    if (err) console.error('Error escribiendo log:', err);
  });
}

module.exports = { logToFile };