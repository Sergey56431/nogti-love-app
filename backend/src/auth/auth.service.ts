import { Injectable } from '@nestjs/common';
import { LoginDto } from './auth-dto/login-dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

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
