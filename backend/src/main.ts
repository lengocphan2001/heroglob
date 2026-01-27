import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 4000);
  const prefix = config.get<string>('app.prefix', 'api');
  const corsOrigins = config.get<string[]>('app.corsOrigins', []);
  const uploadDir = join(process.cwd(), config.get<string>('app.uploadDir', 'uploads'));
  const productsUploadDir = join(uploadDir, 'products');
  if (!existsSync(productsUploadDir)) {
    mkdirSync(productsUploadDir, { recursive: true });
  }

  app.setGlobalPrefix(prefix);
  app.useStaticAssets(uploadDir, { prefix: `/${prefix}/uploads` });
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}/${prefix}`);
}
bootstrap();
