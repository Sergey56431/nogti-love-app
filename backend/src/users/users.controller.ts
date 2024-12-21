import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './users-dto/user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  public findAll() {
    return this._usersService.findAll();
  }

  @Post()
  public createUser(@Body('user') dto: UserDto) {
    return this._usersService.createUser(dto)
  }
}



