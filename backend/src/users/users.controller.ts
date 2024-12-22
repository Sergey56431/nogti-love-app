import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  public findAll() {
    return this._usersService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string) {
    return this._usersService.findOne(id);
  }

  @Post()
  public async createUser(@Body('user') dto: UserCreateDto) {
    return await this._usersService.createUser(dto);
  }

  @Put(':id')
  public updateUser(
    @Param('id') id: string,
    @Body('user') dto: TUserUpdateDto,
  ) {
    return this._usersService.updateUser(id, dto);
  }

  @Delete(':id')
  public deleteUser(@Param('id') id: string) {
    return this._usersService.deleteUser(id);
  }
}
