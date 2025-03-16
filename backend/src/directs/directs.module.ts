import { Module } from '@nestjs/common';
import { BookSlotsAlgorithm, DirectsService } from './directs.service';
import { DirectsController } from './directs.controller';
import { PrismaService } from '../prisma';
import { SettingsModule } from '../settings';
import { ServicesModule } from '../services';
import { CategoriesModule } from '../categories';
import { FreeSlotModule } from '../freeSlots';
import { TimeSlotAlgorithmModule } from '../utilits/TimeSlotAlgorithm.module';

@Module({
  controllers: [DirectsController],
  providers: [
    PrismaService,
    {
      provide: DirectsService,
      useClass: DirectsService,
    },
    BookSlotsAlgorithm,
  ],
  exports: [DirectsService],
  imports: [FreeSlotModule, TimeSlotAlgorithmModule],
})
export class DirectsModule {}
