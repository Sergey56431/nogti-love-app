import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';
import { UsersModule } from './users';
import { AuthModule } from './auth';
import { DirectsModule } from './directs';
import { JwtStrategy } from './auth/jwt-strategy';
import { CalendarModule } from './calendar';
import { IncomExpencesModule } from './incom_expences/incom_expences.module';
import { CategoriesModule } from './categories';
import { ServicesModule } from './services';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DirectsModule,
    CalendarModule,
    IncomExpencesModule,
    CategoriesModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
