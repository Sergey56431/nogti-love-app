import { Controller, Get, Query, Post, Put, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('role')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get('allRoles')
  public async findAllRoles() {
    return this.roleService.findAllRoles();
  }
  @Get()
  public async findRoleByUserID(@Query('userId') userId) {
    return this.roleService.findAllRolesByUserID(userId);
  }
  @Post()
  public async createRole(
    @Query('nameRole') name: string,
    @Query('userId') userId: string,
  ) {
    return this.roleService.createRole(name, userId);
  }
  @Put()
  public async updateRole(
    @Query('roleId') roleId: string,
    @Query('name') name: string,
  ) {
    return this.roleService.updateRole(roleId, name);
  }
  @Delete()
  public async deleteRole(@Query('roleId') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }
}
