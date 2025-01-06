import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { PrismaService } from '../prisma';
import { ConfigService } from '@nestjs/config';

interface User {
  id: string;
  role: string;
}

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

    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });

    console.log(await this.generateAccessToken(user));

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
    const user = await this._usersService.findUserToRefresh(userId);
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
    try {
      await this._usersService.updateUser(userId, { refreshToken: '' });
      return {
        status: HttpStatus.OK,
        message: 'Logged out successfully',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async validateUser(body: LoginDto): Promise<User | null> {
    const user = await this._usersService.findUniqUser(body.username);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return {
        id: user.id,
        role: user.role,
      };
    } else {
      return null;
    }
  }

  public async generateAccessToken(user: User) {
    return this._jwtService.signAsync(user, {
      secret: this._configService.get<string>('JWT_SECRET'),
      expiresIn: this._configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  public generateRefreshToken(user: User) {
    return this._jwtService.signAsync(user, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
