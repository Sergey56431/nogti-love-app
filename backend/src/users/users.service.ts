import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto/user-dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly _prismaService: PrismaService,
    // private readonly _configService: ConfigService,
  ) {}

  public async findAll() {
    return this._prismaService.user.findMany();
  }

  public async findUniqUser(username: string) {
    return this._prismaService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  public findOne(id: string) {
    return this._prismaService.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  public createUser(dto: UserCreateDto) {
    // Сделать проверку на уникальность чтобы не добавлять одинаковых пользователей
    return this._prismaService.user.create({
      data: dto,
    });
  }

  public updateUser(id: string, data: TUserUpdateDto) {
    return this._prismaService.user.update({
      where: {
        id: parseInt(id),
      },
      data: data,
    });
  }

  public deleteUser(id: string) {
    return this._prismaService.user.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
}
