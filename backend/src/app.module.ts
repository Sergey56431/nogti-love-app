import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';
import { UsersModule } from './users';
import { AuthModule } from './auth';
import { DirectsModule } from './directs';
import { JwtStrategy } from './auth/jwt-strategy';
import { CalendarModule } from './calendar';

@Module({
  imports: [UsersModule, AuthModule, DirectsModule, CalendarModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
