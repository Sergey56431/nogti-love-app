import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import {
  TokenException,
  UserAlreadyException,
  UserNotFoundException,
} from '../custom-exceptions/custom-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(username: string, pass: string, res: any): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const payload = {
        username: user.username,
        sub: user.id.toString(),
        role: user.role,
      };

      const refeshToken = await this.generateRefreshToken(payload);
      await this.usersService.update(user.id, <UpdateUserDto>{
        refreshToken: refeshToken,
      });
      res.cookie('refreshToken', refeshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 14 * 1000,
        sameSite: 'none',
      });
      return {
        accessToken: await this.generateAccessToken(payload),
        ref: refeshToken,
        id: user.id,
      }; // ВРЕМЕННО В ТЕЛЕ ПОТОМ УБРАТЬ!!!!
    }
    throw new UserNotFoundException();
  }

  async logout(userId: string, res: any): Promise<any> {
    res.clearCookie('refreshToken');
    return await this.usersService.update(userId, <UpdateUserDto>{
      refreshToken: '',
    });
  }

  async signUp(userDto: CreateUserDto): Promise<any> {
    const existingUser = await this.usersService.findByUsername(
      userDto.username,
    );
    if (existingUser) {
      throw new UserAlreadyException();
    }

    const createdUser = await this.usersService.create(userDto);

    return {
      id: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
      points: createdUser.points,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const user = await this.usersService.findOne({ refreshToken });
    if (!user) {
      throw new TokenException();
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    const accessToken = await this.generateAccessToken(payload);

    return { accessToken };
  }

  private async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  private async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
