import { Controller, Post, Get, Delete, Body } from '@nestjs/common';
import { LoginDto } from './client-dto/login-dto';
import { AuthClientService } from './auth-client.service';

@Controller('auth-client')
export class AuthClientController {
  constructor(private readonly _authService: AuthClientService) {
  }
  @Post()
  public async login(@Body() loginDto: LoginDto){
    return await this._authService.login(loginDto)
  }
}
