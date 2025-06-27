const ENV = {
  dev: {
    API_URL: 'http://localhost:3000/api',
    SOCKET_URL: 'http://localhost:3000',
  },
  prod: {
    API_URL: 'https://api.gotaxi.com/api',
    SOCKET_URL: 'https://api.gotaxi.com',
  },
};

const getEnvVars = (env = '') => {
  if (env === null || env === undefined || env === '') return ENV.dev;
  if (env.indexOf('dev') !== -1) return ENV.dev;
  if (env.indexOf('prod') !== -1) return ENV.prod;
  return ENV.dev;
};

export default getEnvVars(process.env.NODE_ENV);
