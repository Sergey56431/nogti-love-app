import { Module } from '@nestjs/common';
import { DirectsService, DirectsServiceForAlgorithm } from './directs.service';
import { DirectsController } from './directs.controller';
import { PrismaService } from '../prisma';
import { TimeSlotAlgorithmModule } from '../utilits';

@Module({
  controllers: [DirectsController],
  providers: [
    PrismaService,
    {
      provide: 'IDirectsService',
      useClass: DirectsService,
    },
    {
      provide: 'IDirectsServiceAlgorithm',
      useClass: DirectsServiceForAlgorithm,
    },
  ],
  imports: [TimeSlotAlgorithmModule],
  exports: ['IDirectsService', 'IDirectsServiceAlgorithm'],
})
export class DirectsModule {}
