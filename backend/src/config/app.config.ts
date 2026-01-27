import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  prefix: process.env.API_PREFIX ?? 'api',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  publicUrl: process.env.APP_PUBLIC_URL ?? 'http://localhost:4000',
  corsOrigins: [
    process.env.CORS_ORIGIN_FE ?? 'http://localhost:3000',
    process.env.CORS_ORIGIN_ADMIN ?? 'http://localhost:5173',
  ].filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
}));
