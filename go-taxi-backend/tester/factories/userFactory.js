const { randomUUID } = require('crypto');

function buildUser(overrides = {}) {
  const rnd = randomUUID().slice(0, 8);
  return {
    name: `Test User ${rnd}`,
    email: `test_${rnd}@example.com`,
    password: 'Passw0rd!',
    ...overrides,
  };
}

module.exports = { buildUser };