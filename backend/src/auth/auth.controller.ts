import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './auth-dto';
import { UserCreateDto } from '../users';
import { CustomSwaggerUserIdParam } from '../custom-swagger';

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
