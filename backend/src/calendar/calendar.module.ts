import { forwardRef, Module } from '@nestjs/common';
import {
  CalendarService,
  CalendarServiceForAlgorithm,
} from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaService } from 'src/prisma';
import { TimeSlotAlgorithmModule } from '../utilits';
import { FreeSlotService } from '../freeSlots';
import { SettingsService } from '../settings';

@Module({
  controllers: [CalendarController],
  providers: [
    PrismaService,
    FreeSlotService,
    SettingsService,
    {
      provide: 'ICalendarService',
      useClass: CalendarService,
    },
    {
      provide: 'ICalendarServiceAlgorithm',
      useClass: CalendarServiceForAlgorithm,
    },
  ],
  imports: [forwardRef(() => TimeSlotAlgorithmModule)],
  exports: ['ICalendarService', 'ICalendarServiceAlgorithm'],
})
export class CalendarModule {}
