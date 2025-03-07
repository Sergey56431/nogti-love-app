import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';
import { UsersModule } from './users';
import { AuthModule } from './auth';
import { DirectsModule } from './directs';
import { JwtStrategy } from './auth/jwt-strategy';
import { CalendarModule } from './calendar';
import { IncomExpencesModule } from './incom_expences';
import { CategoriesModule } from './categories';
import { ServicesModule } from './services';
import { SettingsModule } from './settings/settings.module';
import { CategoryOperationsModule } from './categoryOperations';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DirectsModule,
    CalendarModule,
    IncomExpencesModule,
    CategoriesModule,
    ServicesModule,
    SettingsModule,
    CategoryOperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
