import { Module } from '@nestjs/common';
import { CalendarService, GenerateSlotsAlgorithm } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaService } from 'src/prisma';
import { FreeSlotModule } from '../freeSlots';
import { TimeSlotAlgorithmModule } from '../utilits/TimeSlotAlgorithm.module';

@Module({
  controllers: [CalendarController],
  imports: [FreeSlotModule, TimeSlotAlgorithmModule],
  providers: [
    PrismaService,
    GenerateSlotsAlgorithm,
    {
      provide: CalendarService,
      useClass: CalendarService,
    },
  ],
  exports: [CalendarService],
})
export class CalendarModule {}
