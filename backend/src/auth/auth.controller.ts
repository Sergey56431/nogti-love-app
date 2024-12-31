import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('login')
  public async _login(@Body() body: LoginDto): Promise<any> {
    return await this._authService.login(body);
  }
}
