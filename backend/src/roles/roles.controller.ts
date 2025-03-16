import {
  Controller,
  Get,
  Query,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleCreateDto, RoleUpdateDto } from './roles-dto/roles-dto';
import { TokenGuard } from '../auth/auth.guard';
@UseGuards(TokenGuard)
@Controller('role')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}
  @Get()
  public async findRole(@Query('userId') userId, @Query('id') id) {
    if (userId) {
      return this.roleService.findAllRolesByUserID(userId);
    }
    if (id) {
      return this.roleService.findRoleById(id);
    } else {
      return this.roleService.findAllRoles();
    }
  }
  @Post()
  public async createRole(@Body() dto: RoleCreateDto) {
    return this.roleService.createRole(dto);
  }
  @Put()
  public async updateRole(
    @Query('id') roleId: string,
    @Body() dto: RoleUpdateDto,
  ) {
    return this.roleService.updateRole(roleId, dto);
  }
  @Delete()
  public async deleteRole(@Query('id') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }
}
