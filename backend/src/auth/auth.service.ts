import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface User {
  id: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    userId: string;
    name: string;
    role: string;
  }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Неверные учетные данные', 401);
    }

    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      access_token: await this.generateAccessToken(user),
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    return this._usersService.createUser(user);
  }

  public async refreshToken(userId: string): Promise<{ accessToken: string }> {
    try {
      const user = await this._usersService.findUserToRefresh(userId);
      if (!user) {
        throw new HttpException('Пользователь не найден', 404);
      }
      if (!user.refreshToken) {
        throw new HttpException('Токен отсутствует', 401);
      }

      try {
        await this._jwtService.verify(user.refreshToken, {
          secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        });
      } catch (e) {
        await this.logout(userId);
        console.error(e);
        throw new HttpException('Токен истек', 401);
      }
      return {
        accessToken: await this.generateAccessToken({
          id: user.id,
          name: user.name + ' ' + user.lastName,
          role: user.role,
        }),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка при обновлении токена', 500);
    }
  }

  public async logout(userId: string) {
    try {
      await this._usersService.updateUser(userId, { refreshToken: '' });
      return {
        status: 200,
        message: 'Успешно',
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Пользователь не найден', 404);
      }
      throw new HttpException(error, 500);
    }
  }

  public async validateUser(
    body: LoginDto | UserCreateDto,
  ): Promise<User | null> {
    const user = await this._usersService.findUniqUser(body.phoneNumber);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return {
        id: user.id,
        name: user.name + ' ' + user.lastName,
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
