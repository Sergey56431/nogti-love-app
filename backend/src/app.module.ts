import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';
import { UsersModule } from './users';
import { AuthModule } from './auth';
import { CommonMiddleware } from './common';
import { DirectsModule } from './directs';

@Module({
  imports: [UsersModule, AuthModule, DirectsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CommonMiddleware).forRoutes({
      path: 'users',
      method: RequestMethod.ALL,
    });
  }
}
