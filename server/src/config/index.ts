import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  telebirr: {
    apiKey: process.env.TELEBIRR_API_KEY || '',
    apiSecret: process.env.TELEBIRR_API_SECRET || '',
    endpoint: process.env.TELEBIRR_ENDPOINT || '',
  },
  bankApiKey: process.env.BANK_API_KEY || '',
};
