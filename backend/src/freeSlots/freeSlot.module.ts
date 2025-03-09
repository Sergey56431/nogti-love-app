import { Module } from '@nestjs/common';
import { FreeSlotService } from './freeSlot.service';
import { PrismaService } from '../prisma';

@Module({
  providers: [FreeSlotService, PrismaService],
  exports: [FreeSlotService],
})
export class FreeSlotModule {}
