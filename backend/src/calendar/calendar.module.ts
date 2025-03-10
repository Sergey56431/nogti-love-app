import { Module, forwardRef } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaService } from 'src/prisma';
import { TimeSlotAlgorithmModule } from '../utilits';
import { FreeSlotService } from '../freeSlots';
import { SettingsService } from '../settings';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, PrismaService, FreeSlotService, SettingsService],
  imports: [forwardRef(() => TimeSlotAlgorithmModule)],
  exports: [CalendarService],
})
export class CalendarModule {}
