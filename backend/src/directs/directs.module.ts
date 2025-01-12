import { Module } from '@nestjs/common';
import { DirectsService } from './directs.service';
import { DirectsController } from './directs.controller';
import {PrismaService} from "../prisma";

@Module({
  controllers: [DirectsController],
  providers: [DirectsService, PrismaService],
})
export class DirectsModule {}
