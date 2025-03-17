import { Module } from '@nestjs/common';
import { OperationsService } from './incom_expences.service';
import { IncomeExpencesController } from './incom_expences.controller';
import { PrismaService } from '../prisma';

@Module({
  controllers: [IncomeExpencesController],
  providers: [
    {
      provide: OperationsService,
      useClass: OperationsService,
    },
    PrismaService,
  ],
  exports: [OperationsService],
})
export class IncomExpencesModule {}
