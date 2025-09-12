const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connect() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri; // tu app usará este URI en test
  await mongoose.connect(uri, { dbName: 'gotaxi_test' });
}

async function disconnect() {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
}

module.exports = { connect, disconnect };