import { Module } from '@nestjs/common';
import { AuthClientController } from './auth-client.controller';

@Module({
  controllers: [AuthClientController]
})
export class AuthClientModule {}
