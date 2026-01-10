import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  app: {
    port: parseInt(process.env.PORT || "3001", 10),
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET || 'TRITHUC_HOTEL_2026_ACCESS_TOKEN',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'TRITHUC_HOTEL_2026_REFRESH_TOKEN',
    expireIn: process.env.JWT_EXPIRESIN || '1h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
};

export default config