import { Module } from '@nestjs/common';
import { CategoryOperationsController } from './categoryOperations.controller';
import { CategoryOperationsService } from './categoryOperations.service';
import { PrismaService } from '../prisma';

@Module({
  controllers: [CategoryOperationsController],
  providers: [
    {
      provide: CategoryOperationsService,
      useClass: CategoryOperationsService,
    },
    PrismaService,
  ],
  exports: [CategoryOperationsService],
})
export class CategoryOperationsModule {}
