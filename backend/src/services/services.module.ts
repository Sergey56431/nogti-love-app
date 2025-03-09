import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaService } from '../prisma';

@Module({
  providers: [ServicesService, PrismaService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}
