import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { PrismaService } from '../prisma';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
    private readonly _prismaService: PrismaService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string; userId: string }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Очистка старого токена перед созданием нового
    await this._usersService.updateUser(user.id, { refreshToken: '' });

    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });

    return {
      userId: user.id,
      access_token: await this.generateAccessToken(user),
      refresh_token: refreshTokenKey,
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    return this._usersService.createUser(user);
  }

  public async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this._usersService.findOne(userId);
    if (!user.refreshToken) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this._jwtService.verify(user.refreshToken, {
        secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
    } catch (e) {
      await this.logout(userId);
      throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
    }
    return { accessToken: await this.generateAccessToken(user) };
  }

  public async logout(userId: string) {
    this._prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: '0',
      },
    });
    return HttpStatus.OK;
  }

  public async validateUser(body: LoginDto): Promise<UserCreateDto | null> {
    const user = await this._usersService.findUniqUser(body.username);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return user;
    } else {
      return null;
    }
  }

  public async generateAccessToken(user: UserCreateDto) {
    return this._jwtService.sign(user, {
      secret: this._configService.get<string>('JWT_SECRET'),
      expiresIn: this._configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  public generateRefreshToken(user: UserCreateDto) {
    return this._jwtService.sign(user, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
