import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma';
import { UsersService } from '../users';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UsersService],
})
export class AuthModule {}
