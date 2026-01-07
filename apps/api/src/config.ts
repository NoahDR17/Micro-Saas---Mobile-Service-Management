import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-this',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  cookieName: process.env.COOKIE_NAME || 'msm_auth',
} as const;
