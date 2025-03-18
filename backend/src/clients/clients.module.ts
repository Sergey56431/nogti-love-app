import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';

@Module({
  providers: [
    {
      provide: ClientsService,
      useClass: ClientsService,
    },
  ],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
