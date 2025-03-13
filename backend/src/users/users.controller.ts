import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import { TokenGuard } from '../auth/auth.guard';
import { CustomSwaggerUserIdParam } from '../custom-swagger';

@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  public async findOne(
    @Query('id') id: string,
    @Query('role') role: string,
    @Query('phoneNumber') phoneNumber: string,
    @Query('username') username: string,
    @Query('score') score: number,
  ) {
    if (role || phoneNumber || username || score) {
      return await this._usersService.findFiltred({
        role,
        phoneNumber,
        username,
        score: +score,
      });
    }
    if (id) {
      return await this._usersService.findOne(id);
    } else {
      return this._usersService.findAll();
    }
  }

  @Post()
  public async createUser(@Body('user') dto: UserCreateDto) {
    return await this._usersService.createUser(dto);
  }

  @CustomSwaggerUserIdParam()
  @Put()
  public async updateUser(
    @Query('id') id: string,
    @Body('user') dto: TUserUpdateDto,
  ) {
    return await this._usersService.updateUser(id, dto);
  }

  @CustomSwaggerUserIdParam()
  @Delete()
  public async deleteUser(@Query('id') id: string) {
    return await this._usersService.deleteUser(id);
  }
  @Get('client')
  public async findClientsByAdminID(@Query('adminID') admin_id: string) {
    return await this._usersService.findAllClientsByAdminID(admin_id);
  }
}
