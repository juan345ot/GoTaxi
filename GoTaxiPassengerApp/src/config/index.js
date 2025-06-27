import dev from './dev';
import prod from './prod';

// Por defecto usa 'dev', cambiar a 'prod' si se despliega
const ENVIRONMENT = process.env.NODE_ENV || 'dev';

const config = ENVIRONMENT === 'prod' ? prod : dev;

export default config;
