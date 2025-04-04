import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateClientsDto } from '../../clients/dto';
import { ClientsService } from '../../clients';
import { IUsersService } from '../../users/interfaces';
import * as process from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ClientsService)
    private readonly usersService: IUsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET2,
    });
  }

  async validate(payload: any): Promise<CreateClientsDto> {
    const user = await this.usersService.findUserToRefresh(payload.id);
    if (!user) {
      throw new HttpException('Вы используете чужой токен', 401);
    }
    return user;
  }
}
