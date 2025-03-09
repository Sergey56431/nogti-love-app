import { Module, forwardRef } from '@nestjs/common';
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
    CalendarModule,
    CategoriesModule,
  ],
  providers: [TimeSlotAlgorithm],
  exports: [TimeSlotAlgorithm],
})
export class TimeSlotAlgorithmModule {}
