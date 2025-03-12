import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLogger } from '../logger';

@Injectable()
export class UsersService {
  private _returnUserModel = {
    id: true,
    name: true,
    lastName: true,
    phoneNumber: true,
    refreshToken: false,
    score: true,
    password: false,
    role: true,
  };

  private readonly logger = new CustomLogger();

  constructor(private readonly _prismaService: PrismaService) {}

  public async findAll() {
    try {
      const users = await this._prismaService.user.findMany({
        select: this._returnUserModel,
      });

      this.logger.log('Успешно получен список пользователей');
      return users;
    } catch (error) {
      this.logger.error('Ошибка при получении списка пользователей', error.stack);
      throw new HttpException('Ошибка сервера при получении списка пользователей', 500);
    }
  }

  public async findUniqUser(phoneNumber: string) {
    try {
      const user = await this._prismaService.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        this.logger.warn(`Пользователь с номером ${phoneNumber} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }

      this.logger.log(`Пользователь с номером ${phoneNumber} найден`);
      return user;
    } catch (error) {
      this.logger.error(`Ошибка при поиске пользователя с номером ${phoneNumber}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске пользователя', 500);
    }
  }

  public async findUserToRefresh(id: string) {
    try {
      const user = await this._prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`Пользователь с ID ${id} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }

      this.logger.log(`Пользователь с ID ${id} найден для обновления`);
      return user;
    } catch (error) {
      this.logger.error(`Ошибка при поиске пользователя с ID ${id} для обновления`, error.stack);
      throw new HttpException('Ошибка сервера при поиске пользователя по ID', 500);
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.user.findUnique({
        select: this._returnUserModel,
        where: { id },
      });

      if (!result) {
        this.logger.warn(`Пользователь с ID ${id} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }

      this.logger.log(`Пользователь с ID ${id} успешно найден`);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Ошибка при поиске пользователя с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске пользователя по ID', 500);
    }
  }

  public async findFiltred(filter: any) {
    if (isNaN(filter.score)) {
      filter.score = undefined;
    }

    try {
      const result = await this._prismaService.user.findMany({
        where: { ...filter },
        select: this._returnUserModel,
      });

      if (!result[0]) {
        this.logger.warn('Пользователи не найдены по фильтру');
        throw new HttpException('Пользователи не найдены', 404);
      }

      this.logger.log('Пользователи успешно найдены по фильтру');
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Ошибка при поиске пользователей по фильтру', error.stack);
      throw new HttpException('Ошибка сервера при поиске пользователей по фильтру', 500);
    }
  }

  public async createUser(dto: UserCreateDto) {
    const { password, phoneNumber } = dto;
    if (!password || !phoneNumber) {
      this.logger.warn('Отсутствуют необходимые данные для создания пользователя');
      throw new HttpException('Отсутствуют необходимые данные для создания пользователя', 400);
    }

    const existingUser = await this._prismaService.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      this.logger.warn('Пользователь с таким phoneNumber уже существует');
      throw new HttpException('Пользователь с таким phoneNumber уже существует', 409);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this._prismaService.user.create({
        select: this._returnUserModel,
        data: { ...dto, password: hashedPassword },
      });

      await this._prismaService.settings.create({
        data: {
          userId: user.id,
          defaultBreakTime: '00:30',
          timeGranularity: '00:30',
          defaultWorkTime: '09:00-16:00',
        },
      });

      this.logger.log(`Пользователь с ID ${user.id} успешно создан`);
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        this.logger.warn('Пользователь с таким именем уже существует');
        throw new HttpException('Пользователь с таким именем уже существует', 409);
      }

      this.logger.error('Ошибка при создании пользователя', error.stack);
      throw new HttpException('Ошибка сервера при создании пользователя', 500);
    }
  }

  public async updateUser(id: string, data: TUserUpdateDto) {
    if (!id) {
      this.logger.warn('Отсутствует ID пользователя');
      throw new HttpException('Отсутствует ID пользователя', 400);
    }

    try {
      const updatedUser = await this._prismaService.user.update({
        select: this._returnUserModel,
        where: { id },
        data,
      });

      this.logger.log(`Пользователь с ID ${id} успешно обновлен`);
      return updatedUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Пользователь с ID ${id} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }

      this.logger.error(`Ошибка при обновлении пользователя с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при обновлении пользователя', 500);
    }
  }

  public async deleteUser(id: string) {
    try {
      this.logger.log(`Удаление пользователя с ID ${id}`);
      return await this._prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Пользователь с ID ${id} не найден при удалении`);
        throw new HttpException('Пользователь не найден', 404);
      }

      this.logger.error(`Ошибка при удалении пользователя с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при удалении пользователя', 500);
    }
  }
}
