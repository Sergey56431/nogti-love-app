import {Body, Controller, Post} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./dto/createUser.dto";
import {UserResponseType} from "./types/usersResponse.type";
import {LoginDto} from "./dto/login.dto";

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(
        @Body() createUserDto: CreateUserDto
    ): Promise<UserResponseType> {
        const user = await this.usersService.createUser(createUserDto)
        return this.usersService.buildUserResponse(user)
    }
    @Post('login')
    async login(
        @Body() loginDto: LoginDto
    ): Promise<UserResponseType> {
        const user = await this.usersService.loginUser(loginDto)
        return this.usersService.buildUserResponse(user)
    }

}
