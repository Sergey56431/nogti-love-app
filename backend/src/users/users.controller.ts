import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import { TokenGuard } from '../auth/auth.guard';

@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  public async findAll() {
    return this._usersService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this._usersService.findOne(id);
  }

  @Post()
  public async createUser(@Body('user') dto: UserCreateDto) {
    return await this._usersService.createUser(dto);
  }

  @Put(':id')
  public async updateUser(
    @Param('id') id: string,
    @Body('user') dto: TUserUpdateDto,
  ) {
    return await this._usersService.updateUser(id, dto);
  }

  @Delete(':id')
  public async deleteUser(@Param('id') id: string) {
    return await this._usersService.deleteUser(id);
  }
}
