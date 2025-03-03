import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from '../prisma';

@Module({
  providers: [SettingsService, PrismaService],
  controllers: [SettingsController],
})
export class SettingsModule {}
