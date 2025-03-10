import { forwardRef, Module } from '@nestjs/common';
import { DirectsService } from './directs.service';
import { DirectsController } from './directs.controller';
import { PrismaService } from '../prisma';
import { TimeSlotAlgorithmModule } from '../utilits';

@Module({
  controllers: [DirectsController],
  providers: [DirectsService, PrismaService],
  imports: [forwardRef(() => TimeSlotAlgorithmModule)],
  exports: [DirectsService],
})
export class DirectsModule {}
