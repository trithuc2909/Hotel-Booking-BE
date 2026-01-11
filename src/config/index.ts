import dotenv from 'dotenv';
import logger from './logger.config';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  env: NODE_ENV,

  app: {
    port: Number(process.env.PORT || 3001),
    name: 'Hotel Booking API',
  },

  database: {
    url: process.env.DATABASE_URL as string,
  },

  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET as string,
    expiresIn: process.env.JWT_EXPIRESIN || '1h',
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  security: {
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLE === 'true',
      max: Number(process.env.RATE_LIMIT_MAX || 100),
    },
  },

  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
};


if (!config.database.url) {
  throw new Error('❌ DATABASE_URL is required');
}

if (config.isProduction) {
  if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error('❌ JWT secrets must be set in production');
  }
}

export default config;
