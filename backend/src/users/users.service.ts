import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './users-dto/user-dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly _prismaService: PrismaService,
    // private readonly _configService: ConfigService,
  ) {}

  public findAll() {
    return this._prismaService.user.findMany();
  }

  public createUser(dto: UserDto) {
    return this._prismaService.user.create({
      data: dto,
    });
  }
}
