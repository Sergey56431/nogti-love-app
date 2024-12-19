import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TokenGuard } from '../auth/auth.guard';
import { ApiParamUserId } from '../custom-swagger/api-responses';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    example: [
      {
        id: '66e03798d9bdb992d25d3e9c',
        username: 'test',
        role: 'user',
        points: 20,
      },
      {
        id: '66e03798d9bdb992d25d36t3',
        username: 'test1',
        role: 'user',
        points: 20,
      },
    ],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiParamUserId()
  @ApiResponse({
    status: 200,
    example: {
      id: '66e03798d9bdb992d25d3e9c',
      username: 'test',
      role: 'user',
      points: 20,
    },
  })
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiParamUserId()
  @ApiResponse({
    status: 200,
    example: {
      id: '66e03798d9bdb992d25d3e9c',
      username: 'test Updated',
      role: 'user',
      points: 20,
    },
  })
  @ApiOperation({ summary: 'Изменить пользователя по ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    example: {
      id: '66e03798d9bdb992d25d3e9c',
      username: 'test',
      role: 'user',
      points: 20,
    },
  })
  @ApiParamUserId()
  @ApiOperation({ summary: 'Удалить пользователя по ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
