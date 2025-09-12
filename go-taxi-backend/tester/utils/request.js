const request = require('supertest');
const path = require('path');

let app;

function getApp() {
  if (!app) {
    const appPath = path.resolve(__dirname, '../../src/app.js');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    app = require(appPath);
  }
  return request(app);
}

module.exports = getApp;