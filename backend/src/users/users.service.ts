import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import * as bcrypt from 'bcrypt';

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
        data: {
          ...dto,
          password: hashedPassword,
        },
      })
      .then((createdUser) => {
        console.log(createdUser.password); // Логируем хэшированный пароль
        return createdUser;
      });
  }

  public updateUser(id: string, data: TUserUpdateDto) {
    return this._prismaService.user.update({
      where: {
        id,
      },
      data: data,
    });
  }

  public deleteUser(id: string) {
    return this._prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
