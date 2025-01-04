import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { PrismaService } from '../prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _prismaService: PrismaService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string; userId: string }> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const refreshTokenKey = await this.generateRefreshToken(user);
    await this._usersService.updateUser(user.id, {
      refreshToken: refreshTokenKey,
    });
    return {
      userId: user.id,
      access_token: await this.generateAccessToken(user),
      refresh_token: refreshTokenKey,
    };
  }

  public async signUp(user: SignupDto): Promise<UserCreateDto> {
    return this._usersService.createUser(user);
  }

  public async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this._usersService.findOne(userId);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return { accessToken: await this.generateAccessToken(user) };
  }

  public async logout(userId: string) {
    this._prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
    return HttpStatus.OK;
  }

  public async validateUser(body: LoginDto): Promise<UserCreateDto | null> {
    const user = await this._usersService.findUniqUser(body.username);
    if (user && (await bcrypt.compare(body.password, user.password))) {
      return user;
    } else {
      return null;
    }
  }

  public async generateAccessToken(user: UserCreateDto) {
    return this._jwtService.signAsync(user, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  public generateRefreshToken(user: UserCreateDto) {
    return this._jwtService.signAsync(user, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }
}
