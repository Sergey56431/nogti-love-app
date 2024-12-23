import { Module } from '@nestjs/common';
import { DirectsService } from './directs.service';
import { DirectsController } from './directs.controller';

@Module({
  controllers: [DirectsController],
  providers: [DirectsService],
})
export class DirectsModule {}
