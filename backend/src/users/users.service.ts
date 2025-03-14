import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  private _returnUserModel = {
    id: true,
    name: true,
    lastName: true,
    username: true,
    phoneNumber: true,
    score: true,
    rate: true,
    birthday: true,
    description: true,
    role: true,
    refreshToken: false,
    password: false,
  };
  private lastName: any;

  constructor(private readonly _prismaService: PrismaService) {}

  public async findAll() {
    try {
      return await this._prismaService.user.findMany({
        select: this._returnUserModel,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при получении списка пользователей',
        500,
      );
    }
  }

  public async findUniqUser(phoneNumber: string) {
    try {
      return await this._prismaService.user.findUnique({
        where: { phoneNumber },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске пользователя', 500);
    }
  }

  public async findUserToRefresh(id: string) {
    try {
      return await this._prismaService.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при поиске пользователя по ID',
        500,
      );
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.user.findUnique({
        select: this._returnUserModel,
        where: { id },
      });

      if (!result) {
        throw new HttpException('Пользователь не найден', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при поиске пользователя по ID',
        500,
      );
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
        throw new HttpException('Пользователи не найден', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при поиске пользователей по фильтру',
        500,
      );
    }
  }

  public async createUser(dto: UserCreateDto) {
    const { password, username, phoneNumber } = dto;
    if (!password || !username || !phoneNumber) {
      throw new HttpException(
        'Отсутствуют необходимые данные для создания пользователя',
        400,
      );
    }

    const existingUser = await this._prismaService.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser) {
      throw new HttpException(
        'Пользователь с таким phoneNumber уже существует',
        409,
      );
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      if (dto.birthday) {
        dto.birthday = new Date(dto.birthday);
      }
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

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          'Пользователь с таким именем уже существует',
          409,
        );
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при создании пользователя', 500);
    }
  }

  public async updateUser(id: string, data: TUserUpdateDto) {
    if (!id) {
      throw new HttpException('Отсутствует ID пользователя', 400);
    }
    try {
      return await this._prismaService.user.update({
        select: this._returnUserModel,
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Пользователь не найден', 404);
      }
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при обновлении пользователя',
        500,
      );
    }
  }

  public async deleteUser(id: string) {
    try {
      return await this._prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Пользователь не найден', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при удалении пользователя', 500);
    }
  }
  public async createRole(name: string, userId: string) {
    try {
      return this._prismaService.customRole.create({
        data: {
          name,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль уже существует', 409);
      }
      throw new HttpException('Ошибка при создании роли', 500);
    }
  }
  public async findAllRolesByUserID(userId: string) {
    try {
      return this._prismaService.customRole.findMany({
        where: { userId },
      });
    } catch {
      throw new HttpException('Ошибка при поиске роли', 500);
    }
  }
  public async deleteClient(id) {
    try {
      return this._prismaService.customRole.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль не найдена', 404);
      }
      throw new HttpException('Ошибка при поиске роли', 500);
    }
  }
}
