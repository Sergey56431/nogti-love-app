import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
  Inject,
} from '@nestjs/common';
import { TUserUpdateDto, UserCreateDto } from './users-dto';
import { TokenGuard } from '../auth/auth.guard';
import { CustomSwaggerUserIdParam } from '../custom-swagger';
import { IUsersService } from './interfaces';
import { UsersService } from './users.service';

@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly _usersService: IUsersService,
  ) {}

  @Get()
  public async findOne(
    @Query('id') id: string,
    @Query('role') role: string,
    @Query('phoneNumber') phoneNumber: string,
    @Query('score') score: number,
  ) {
    if (role || phoneNumber || score) {
      return await this._usersService.findFiltred({
        role,
        phoneNumber,
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
}
