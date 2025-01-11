import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  // app.use(
  //   cors({
  //     origin: 'http://localhost:4200', // Разрешите доступ только с этого источника
  //     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешите необходимые методы
  //     credentials: true, // Если вам нужны куки
  //   }),
  // );
}
bootstrap().then();
