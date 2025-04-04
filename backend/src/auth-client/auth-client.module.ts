import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { AuthClientController } from './auth-client.controller';
import { PrismaService } from '../prisma';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth-client/jwt';
import { ClientsModule, ClientsService } from '../clients';
import { AuthClientGuard } from './auth-client.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
    ClientsModule,
  ],
  controllers: [AuthClientController],
  providers: [
    AuthClientService,
    PrismaService,
    AuthClientGuard,
    ConfigService,
    ClientsService,
    JwtStrategy,
  ],
  exports: [AuthClientService],
})
export class AuthClientModule {}
