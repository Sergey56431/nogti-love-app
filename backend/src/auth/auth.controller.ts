import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpStatus,
  HttpCode,
  Response,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenGuard } from './auth.guard';
import { ApiParamUserId } from '../custom-swagger/api-responses';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Вход' })
  @ApiBody({
    required: true,
    schema: { example: { username: 'test', password: 'test' } },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q1Iiwic3ViIjoiNjZlMDM3OThkOWJkYjk5MmQyNWQzZTljIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjU5NzAzMzksImV4cCI6MTcyNTk4MTEzOX0.s1LEBH2P1SrZXRJ9dCNf7uwFz59gwooYRNKo8hWxEMY',
      ref: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q1Iiwic3ViIjoiNjZlMDM3OThkOWJkYjk5MmQyNWQzZTljIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjU5NzAzMzksImV4cCI6MTcyNTk4MTEzOX0.s1LEBH2P1SrZXRJ9dCNf7uwFz59gwooYRNKo8hWxEMY',
    },
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req,
    @Response() res,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const quary = await this.authService.signIn(
      req.body.username,
      req.body.password,
      res,
    );
    res.status(200).send(quary);
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({
    status: 201,
    description: 'Successful registration',
    example: {
      id: '66e03798d9bdb992d25d3e9c',
      username: 'test',
      role: 'user',
      points: 20,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: 'Обновление токена' })
  @ApiResponse({
    status: 200,
    description: 'Successful token refresh',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q1Iiwic3ViIjoiNjZlMDM3OThkOWJkYjk5MmQyNWQzZTljIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjU5NzAzMzksImV4cCI6MTcyNTk4MTEzOX0.s1LEBH2P1SrZXRJ9dCNf7uwFz59gwooYRNKo8hWxEMY',
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiOperation({ summary: 'Выход' })
  // @UseGuards(TokenGuard)
  @ApiBearerAuth()
  @ApiParamUserId()
  @ApiResponse({ status: 200, description: 'Successful logout' })
  @Post('logout/:id')
  async logout(@Param('id') id: string, @Response() res) {
    await this.authService.logout(id, res);
    res.status(200).send();
  }
}
