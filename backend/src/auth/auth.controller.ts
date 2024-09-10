import {
    Controller,
    Request,
    Post,
    UseGuards,
    Body,
    HttpStatus,
    HttpCode, Res, Response, Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody, ApiParam, ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {TokenGuard} from "./auth.guard";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Вход' })
    @ApiBody({required: true, schema:{example:{username: "test", password:"test"}}})
    @ApiResponse({ status: 200, description: 'Successful login' })
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Response() res, @Body('username') username: string, @Body('password') password: string) {
        res.status(200).send(await this.authService.signIn(req.body.username, req.body.password, res));
    }

    @ApiOperation({ summary: 'Регистрация' })
    @ApiResponse({ status: 201, description: 'Successful registration' })
    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    async signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @ApiOperation({ summary: 'Обновление токена' })
    @ApiResponse({ status: 200, description: 'Successful token refresh' })
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

    @ApiOperation({summary: 'Выход'})
    @UseGuards(TokenGuard)
    @ApiBearerAuth()
    @ApiResponse({status:200, description: 'Successful logout'})
    @Post('logout/:id')
    async logout(@Param('id') id: string, @Response() res) {
        await this.authService.logout(id, res)
        res.status(200).send();
    }
}
