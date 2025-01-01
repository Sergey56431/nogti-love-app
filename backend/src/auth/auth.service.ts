import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string; userId: string }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    //await this.usersService.findUniqUser(user.id, {refreshtoken: });
    return {
      userId: user.id,
      access_token: await this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(user),
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    return this.usersService.createUser(user);
    // Сделать функцию регистрации пользователей
  }

  public async refreshToken(user: UserCreateDto) {
    // Сделать функцию обновления токена
  }

  public async validateUser(body: LoginDto): Promise<UserCreateDto | null> {
    const user = await this.usersService.findUniqUser(body.username);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return user;
    } else {
      return null;
    }
  }

  public async generateAccessToken(user: UserCreateDto) {
    return this.jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  public generateRefreshToken(user: UserCreateDto) {
    return this.jwtService.signAsync(user, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }
}
