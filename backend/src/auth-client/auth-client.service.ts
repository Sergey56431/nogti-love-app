import { Injectable, HttpException } from '@nestjs/common';
import { LoginDto } from './client-dto/login-dto';
import { PrismaService } from '../prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients';
import * as console from 'console';

interface Client {
  id: string;
  name: string;
  access_token: string;
}
@Injectable()
export class AuthClientService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _clientsService: ClientsService,
  ) {}
  public async login(dto: LoginDto) {
    const client = await this._validateClient(dto);
    if (!client) {
      throw new HttpException('Неверные учетные данные', 401);
    }
    const refreshTokenKey = await this._generateRefreshToken(client);
    await this._clientsService.updateClient(client.id, {
      refreshToken: refreshTokenKey,
    });
    return {
      id: client.id,
      name: client.name,
      access_token: await this._generateAccessToken(client),
    };
  }
  private async _validateClient(dto: LoginDto) {
    const client: {
      id: string;
      name: string;
      password: string;
    } = await this._clientsService.findPhoneClient(dto.phoneNumber);
    if (client && (await bcrypt.compare(dto.password, client.password))) {
      return {
        id: client.id,
        name: client.name,
        access_token: '',
      };
    } else {
      console.log('номер телефона или пароль введён неверно');
      return null;
    }
  }
  private async _generateAccessToken(client: Client) {
    return this._jwtService.signAsync(client, {
      secret: this._configService.get<string>('JWT_SECRET'),
      expiresIn: this._configService.get<string>('JWT_EXPIRES_IN'),
    });
  }
  private async _generateRefreshToken(client: Client) {
    return this._jwtService.signAsync(client, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
