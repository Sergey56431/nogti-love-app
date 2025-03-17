import { Module } from '@nestjs/common';
import { FreeSlotsService } from './freeSlots.service';
import { PrismaService } from '../prisma';

@Module({
  providers: [
    {
      provide: FreeSlotsService,
      useClass: FreeSlotsService,
    },
    PrismaService,
  ],
  exports: [FreeSlotsService],
})
export class FreeSlotModule {}
