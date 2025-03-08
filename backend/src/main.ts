import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';

async function bootstrap() {
  let httpsOptions;
  if (process.env.PORT === '443') {
    try {
      httpsOptions = {
        key: fs.readFileSync('./SSL/certificate.key'),
        cert: fs.readFileSync('./SSL/certificate.crt'),
      };
      console.log('starting with SSL.. \n');
    } catch (error) {
      console.error('Ошибка при чтении SSL сертификатов:', error);
      process.exit(1); // Или другая обработка
    }
  } else {
    console.log('starting without SSL.. \n');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://sergey-frontenddev-cashback-app-d231.twc1.net',
        'http://localhost:4200',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS!!'));
      }
    },
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const config = new DocumentBuilder()
    .setTitle('CashBackApp API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap()
  .then(() => console.log('Сервер запущен на порту', process.env.PORT))
  .catch((err) => {
    console.error('Application failed to start:', err);
    process.exit(1);
  });
