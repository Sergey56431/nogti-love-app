import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaService } from '../prisma';

@Module({
  providers: [
    PrismaService,
    {
      provide: ClientsService,
      useClass: ClientsService,
    },
  ],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
