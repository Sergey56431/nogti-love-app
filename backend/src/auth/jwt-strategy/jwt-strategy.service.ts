import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { UserCreateDto, UsersService } from '../../users';
import { IUsersService } from '../../users/interfaces';
import * as process from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersService)
    private readonly usersService: IUsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<UserCreateDto> {
    const user = await this.usersService.findUserToRefresh(payload.id);
    if (!user) {
      throw new HttpException('Вы используете чужой токен', 401);
    }
    return user;
  }
}
