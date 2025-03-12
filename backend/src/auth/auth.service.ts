import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLogger } from '../logger'; // Добавление кастомного логгера

interface User {
  id: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(); // Экземпляр кастомного логгера

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
      this.logger.warn('Неверные учетные данные при попытке входа');
      throw new HttpException('Неверные учетные данные', 401);
    }

    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });

    this.logger.log(`Пользователь ${user.id} успешно вошел в систему`);

    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      access_token: await this.generateAccessToken(user),
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    try {
      const createdUser = await this._usersService.createUser(user);
      this.logger.log(`Пользователь ${createdUser.id} успешно зарегистрирован`);
      return createdUser;
    } catch (error) {
      this.logger.error('Ошибка при регистрации пользователя', error.stack);
      throw new HttpException('Ошибка при регистрации пользователя', 500);
    }
  }

  public async refreshToken(userId: string): Promise<{ accessToken: string }> {
    try {
      const user = await this._usersService.findUserToRefresh(userId);
      if (!user) {
        this.logger.warn(`Пользователь с ID ${userId} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }
      if (!user.refreshToken) {
        this.logger.warn(`Токен отсутствует для пользователя с ID ${userId}`);
        throw new HttpException('Токен отсутствует', 401);
      }

      try {
        await this._jwtService.verify(user.refreshToken, {
          secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        });
      } catch (e) {
        await this.logout(userId);
        this.logger.error('Токен истек для пользователя', e.stack);
        throw new HttpException('Токен истек', 401);
      }

      this.logger.log(`Токен успешно обновлен для пользователя с ID ${userId}`);
      return {
        accessToken: await this.generateAccessToken({
          id: user.id,
          name: user.name + ' ' + user.lastName,
          role: user.role,
        }),
      };
    } catch (error) {
      this.logger.error('Ошибка при обновлении токена', error.stack);
      throw new HttpException('Ошибка при обновлении токена', 500);
    }
  }

  public async logout(userId: string) {
    try {
      await this._usersService.updateUser(userId, { refreshToken: '' });
      this.logger.log(`Пользователь с ID ${userId} успешно вышел из системы`);
      return {
        status: 200,
        message: 'Успешно',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`Пользователь с ID ${userId} не найден при выходе`);
        throw new HttpException('Пользователь не найден', 404);
      }
      this.logger.error(`Ошибка при выходе пользователя с ID ${userId}`, error.stack);
      throw new HttpException('Ошибка при выходе пользователя', 500);
    }
  }

  public async validateUser(body: LoginDto | UserCreateDto): Promise<User | null> {
    const user = await this._usersService.findUniqUser(body.phoneNumber);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return {
        id: user.id,
        name: user.name + ' ' + user.lastName,
        role: user.role,
      };
    } else {
      this.logger.warn('Неверный номер телефона или пароль');
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
