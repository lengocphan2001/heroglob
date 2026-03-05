import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  prefix: process.env.API_PREFIX ?? 'api',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Public API URL used for upload/image URLs. On VPS set APP_PUBLIC_URL=https://api.yourdomain.com so images load from admin/frontend. */
  publicUrl: process.env.APP_PUBLIC_URL ?? 'http://localhost:4000',
  /** Comma-separated allowed origins for CORS, e.g. CORS_ORIGIN=https://admin.heroglobal.io.vn,https://heroglobal.io.vn */
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
}));
