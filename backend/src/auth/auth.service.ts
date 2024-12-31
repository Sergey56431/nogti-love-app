import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto } from './auth-dto';
import { UserCreateDto } from '../users';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto);
    console.log(user);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: user!.username };
    return {
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateUser(body: LoginDto): Promise<UserCreateDto | null> {
    const user = await this.usersService.findUniqUser(body.username);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return user;
    } else {
      return null;
    }
  }
}
