const cors = require('cors');

/*
 * Configuración de CORS con lista blanca parametrizable.
 *
 * Se permite definir orígenes permitidos mediante la variable de entorno
 * CORS_WHITELIST (separados por comas). Por defecto habilita los
 * dominios locales de desarrollo. Si no hay origen (por ejemplo en
 * peticiones de curl), se permite el acceso.
 */

// Lee la whitelist de CORS desde el entorno o usa valores por defecto
const whitelist = (process.env.CORS_WHITELIST || 'http://localhost:3000,http://localhost:19006')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir si no hay origen (como ocurre en algunas llamadas de server-to-server)
    if (!origin || whitelist.includes(origin)) {
      return callback(null, true);
    }
    // Error personalizado para orígenes no permitidos
    const err = new Error('No permitido por CORS');
    // Adjuntamos código y estado para que el errorHandler pueda unificar
    err.status = 403;
    err.code = 'CORS_NOT_ALLOWED';
    return callback(err);
  },
  credentials: true,
};

module.exports = cors(corsOptions);
