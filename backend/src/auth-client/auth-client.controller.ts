import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './client-dto/login-dto';
import { AuthClientService } from './auth-client.service';
import { SignupDto } from 'src/auth/auth-dto';

@Controller('auth-client')
export class AuthClientController {
  constructor(private readonly _authService: AuthClientService) {}
  @Post('login')
  public async login(@Body() loginDto: LoginDto) {
    return await this._authService.login(loginDto);
  }
  @Post('sing-up')
  public async singUp(@Body() singUpDto: SignupDto) {
    return await this._authService.singUp(singUpDto);
  }
}
