import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from '../prisma';

@Module({
  providers: [
    {
      provide: SettingsService,
      useClass: SettingsService,
    },
    PrismaService,
  ],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
