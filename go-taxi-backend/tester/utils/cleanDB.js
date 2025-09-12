const mongoose = require('mongoose');

module.exports = async function cleanDB() {
  const { collections } = mongoose.connection;
  const ops = Object.values(collections).map((c) => c.deleteMany({}));
  await Promise.all(ops);
};