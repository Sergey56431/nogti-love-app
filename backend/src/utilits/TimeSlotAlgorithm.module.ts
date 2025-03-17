import { Module } from '@nestjs/common';
import { ServicesModule } from '../services';
import { SettingsModule } from '../settings';
import { TimeSlotUtilits } from './TimeSlotAlgorithm';
import { FreeSlotModule } from '../freeSlots';
import { CategoriesModule } from '../categories';

@Module({
  imports: [ServicesModule, SettingsModule, FreeSlotModule, CategoriesModule],
  providers: [
    {
      provide: TimeSlotUtilits,
      useClass: TimeSlotUtilits,
    },
  ],
  exports: [TimeSlotUtilits],
})
export class TimeSlotAlgorithmModule {}
