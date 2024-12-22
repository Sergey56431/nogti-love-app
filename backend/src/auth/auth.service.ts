import { Injectable } from '@nestjs/common';
import { LoginDto } from './auth-dto';
import { PrismaService } from '../prisma';
import { UsersService } from '../users';

@Injectable()
export class AuthService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _userService: UsersService,
  ) {}

  public async login(data: LoginDto) {
    const user = await this._userService.findUniqUser(data.username);
  }

  public signIn() {
    return true;
  }
}
