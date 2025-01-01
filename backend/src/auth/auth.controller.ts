import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('login')
  public async _login(@Body() body: LoginDto): Promise<any> {
    return await this._authService.login(body);
  }

  @Post('signup')
  public async signup(@Body() body: SignupDto): Promise<UserCreateDto> {
    return await this._authService.signUp(body);
  }

  @Get('logout')
  public async logout() {
    // return await this._authService.logout();
  }

  @Post('refresh')
  public async refresh() {
    // return await this._authService.refresh();
  }
}
