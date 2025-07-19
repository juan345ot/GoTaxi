const fs = require('fs');
const path = require('path');

function logToFile(message) {
  const logPath = path.join(__dirname, '../logs/app.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

module.exports = { logToFile };
