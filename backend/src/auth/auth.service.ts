import { Injectable, Inject, HttpException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto, UsersService } from '../users';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IUsersService } from '../users/interfaces';
import { IAuthService } from './interfaces';

interface User {
  id: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(UsersService)
    private readonly _usersService: IUsersService,
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    userId: string;
    name: string;
    role: string;
  }> {
    this.logger.log(`Попытка входа пользователя: ${loginDto.phoneNumber}`);
    const user = await this.validateUser(loginDto);
    if (!user) {
      this.logger.warn(
        `Неудачная попытка входа: неверные учетные данные ${user}`,
      );
      throw new HttpException('Неверные учетные данные', 401);
    }

    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });
    this.logger.log(`Пользователь ${user.id} успешно вошел`);
    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      access_token: await this.generateAccessToken(user),
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    this.logger.log(`Регистрация нового пользователя: ${user.phoneNumber}`);
    return this._usersService.createUser(user);
  }

  public async refreshToken(userId: string): Promise<{ accessToken: string }> {
    try {
      this.logger.log(`Обновление токена для пользователя: ${userId}`);
      const user = await this._usersService.findUserToRefresh(userId);
      if (!user) {
        this.logger.warn(
          `Пользователь ${userId} не найден при обновлении токена`,
        );
        throw new HttpException('Пользователь не найден', 404);
      }
      if (!user.refreshToken) {
        this.logger.warn(`Токен отсутствует у пользователя ${userId}`);
        throw new HttpException('Токен отсутствует', 401);
      }

      try {
        await this._jwtService.verify(user.refreshToken, {
          secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        });
      } catch (error) {
        console.error(error);
        await this.logout(userId);
        throw new HttpException('Токен истек', 401);
      }
      this.logger.log(`Токен обновлен для пользователя ${userId}`);
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
      console.error(error);
      this.logger.error(
        `Ошибка при обновлении токена пользователя ${userId}`,
        error.stack,
      );
      throw new HttpException('Ошибка при обновлении токена', 500);
    }
  }

  public async logout(userId: string) {
    try {
      this.logger.log(`Выход пользователя ${userId}`);
      await this._usersService.updateUser(userId, { refreshToken: '' });
      return { status: 200, message: 'Успешно' };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(`Пользователь ${userId} не найден при выходе`);
        throw new HttpException('Пользователь не найден', 404);
      }
      this.logger.error(
        `Ошибка при выходе пользователя ${userId}`,
        error.stack,
      );
      throw new HttpException(error, 500);
    }
  }

  public async validateUser(
    body: LoginDto | UserCreateDto,
  ): Promise<User | null> {
    const user = await this._usersService.findUniqUser(body.phoneNumber);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      this.logger.log(`Пользователь ${user.id} прошел валидацию`);
      return {
        id: user.id,
        name: user.name + ' ' + user.lastName,
        role: user.role,
      };
    } else {
      this.logger.warn(`Ошибка валидации пользователя: ${body.phoneNumber}`);
      return null;
    }
  }

  public async generateAccessToken(user: User) {
    return this._jwtService.signAsync(user, {
      secret: this._configService.get<string>('JWT_SECRET'),
      expiresIn: this._configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  public async generateRefreshToken(user: User) {
    return this._jwtService.signAsync(user, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
