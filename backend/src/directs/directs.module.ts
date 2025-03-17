import { Module } from '@nestjs/common';
import { BookSlotsAlgorithm, DirectsService } from './directs.service';
import { DirectsController } from './directs.controller';
import { PrismaService } from '../prisma';
import { FreeSlotModule } from '../freeSlots';
import { TimeSlotAlgorithmModule } from '../utilits';

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
