import { Module } from '@nestjs/common';
import { ReferalController } from './referal.controller';
import { PrismaService } from '../prisma';
import { ReferalService } from './referal.service';

@Module({
  controllers: [ReferalController],
  providers: [
    {
      provide: ReferalService,
      useClass: ReferalService,
    },
    PrismaService,
  ],
  exports: [ReferalService],
})
export class ReferalModule {}
