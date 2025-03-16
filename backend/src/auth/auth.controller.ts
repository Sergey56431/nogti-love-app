import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { CustomSwaggerUserIdParam } from '../custom-swagger';
import { IAuthService } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly _authService: IAuthService,
  ) {}

  @Post('login')
  public async _login(@Body() body: LoginDto): Promise<any> {
    return await this._authService.login(body);
  }

  @Post('signup')
  public async signup(@Body() body: SignupDto): Promise<UserCreateDto> {
    return await this._authService.signUp(body);
  }

  @CustomSwaggerUserIdParam()
  @Get('logout')
  public async logout(@Query('id') id: string): Promise<any> {
    return await this._authService.logout(id);
  }

  @CustomSwaggerUserIdParam()
  @Get('refresh')
  public async refresh(@Query('id') id: string) {
    return await this._authService.refreshToken(id);
  }
}
