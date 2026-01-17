import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginEnv = process.env.CORS_ORIGIN;
  const corsOrigin =
    corsOriginEnv === '*'
      ? '*'
      : corsOriginEnv?.split(',').map((o) => o.trim()) || [
          'http://localhost:4173',
          'http://localhost:5173',
        ];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
