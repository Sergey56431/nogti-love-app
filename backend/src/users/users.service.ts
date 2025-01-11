import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private _returnUserModel = {
    id: true,
    name: true,
    lastName: true,
    username: true,
    phoneNumber: true,
    refreshToken: false,
    score: true,
    password: false,
    role: true,
  };

  constructor(private readonly _prismaService: PrismaService) {}

  public async findAll() {
    return this._prismaService.user.findMany({
      select: this._returnUserModel,
    });
  }

  public async findUniqUser(username: string) {
    return this._prismaService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  public async findUserToRefresh(id: string) {
    return this._prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  public async findOne(id: string) {
    return this._prismaService.user.findUnique({
      select: this._returnUserModel,
      where: {
        id,
      },
    });
  }

  public async createUser(dto: UserCreateDto) {
    const existingUser = await this._prismaService.user.findUnique({
      where: {
        username: dto.username,
        phoneNumber: dto.phoneNumber,
      },
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this._prismaService.user
      .create({
        select: this._returnUserModel,
        data: {
          ...dto,
          password: hashedPassword,
        },
      })
      .then((createdUser) => {
        return createdUser;
      });
  }

  public async updateUser(id: string, data: TUserUpdateDto) {
    return this._prismaService.user.update({
      select: this._returnUserModel,
      where: {
        id,
      },
      data: data,
    });
  }

  public async deleteUser(id: string) {
    return this._prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
