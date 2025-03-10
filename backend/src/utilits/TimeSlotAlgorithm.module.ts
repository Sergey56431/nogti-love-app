import { forwardRef, Module } from '@nestjs/common';
import { ServicesModule } from '../services';
import { DirectsModule } from '../directs';
import { CalendarModule } from '../calendar';
import { SettingsModule } from '../settings';
import { TimeSlotAlgorithm } from './TimeSlotAlgorithm';
import { FreeSlotModule } from '../freeSlots';
import { CategoriesModule } from '../categories';

@Module({
  imports: [
    ServicesModule,
    SettingsModule,
    forwardRef(() => DirectsModule),
    forwardRef(() => CalendarModule),
    FreeSlotModule,
    CategoriesModule,
  ],
  providers: [
    {
      provide: 'ITimeSlotAlgorithm',
      useClass: TimeSlotAlgorithm,
    },
  ],
  exports: ['ITimeSlotAlgorithm'],
})
export class TimeSlotAlgorithmModule {}
