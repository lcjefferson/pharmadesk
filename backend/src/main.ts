import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://pharmadesk-frontend-417d.onrender.com',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // app.use(
  //   helmet({
  //     contentSecurityPolicy: false,
  //     crossOriginResourcePolicy: false,
  //   }),
  // );

  app.use((req: any, res: any, next: any) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  console.log('Application starting...');
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application listening on port ${port}`);
}
void bootstrap();
