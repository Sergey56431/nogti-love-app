import { Module } from '@nestjs/common';
import { IncomExpencesService } from './incom_expences.service';
import { IncomeExpencesController } from './incom_expences.controller';
import { PrismaService } from '../prisma';

@Module({
  controllers: [IncomeExpencesController],
  providers: [IncomExpencesService, PrismaService],
})
export class IncomExpencesModule {}
