import { Strategy } from 'passport-strategy';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../auth-dto';
import { UserCreateDto } from '../../users';
import { IAuthService } from '../interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthService)
    private readonly authService: IAuthService,
  ) {
    super({
      usernameField: 'phoneNumber',
    });
  }

  async validate(body: LoginDto | UserCreateDto): Promise<any> {
    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
