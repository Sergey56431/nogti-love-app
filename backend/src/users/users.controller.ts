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
import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { TokenGuard } from '../auth/auth.guard';


@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Получить всех пользователей' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiParam({description:'ID пользователя', name:'id', example:'66c23742a5e4374202602bf9'})
    @ApiOperation({ summary: 'Получить пользователя по ID' })
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @ApiParam({description:'ID пользователя', name:'id', example:'66c23742a5e4374202602bf9'})
    //@ApiBody({required: true, description: 'Имя пользователя', schema:{example:{username: "test Updated", password:"test Updated"}}})
    @ApiOperation({ summary: 'Изменить пользователя по ID' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiParam({description:'ID пользователя', name:'id', example:'66c23742a5e4374202602bf9'})
    @ApiOperation({ summary: 'Удалить пользователя по ID' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
