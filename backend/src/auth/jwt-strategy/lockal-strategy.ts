import { Strategy } from 'passport-strategy';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../auth-dto';
import { UserCreateDto } from '../../users';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // Используем email вместо стандартного username
    });
  }

  async validate(body: LoginDto | UserCreateDto): Promise<any> {
    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException(); // Бросаем исключение, если пользователь не найден
    }
    return user;
  }
}
