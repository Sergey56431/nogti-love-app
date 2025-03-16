import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleCreateDto, TRoleUpdateDto } from "./roles-dto/roles-dto";

@Injectable()
export class RolesService {
  constructor(private readonly _prismaService: PrismaService) {}
  public async createRole(dto: RoleCreateDto) {
    const {name, userId} = dto
    try {
      return this._prismaService.customRole.create({
        data: {
          name,
          userId,
        },
      });
    } catch (error) {
      console.log('Ошибка при создании роли');
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль уже существует', 409);
      }
      throw new HttpException('Ошибка при создании роли', 500);
    }
  }
  public async findAllRolesByUserID(userId) {
    try {
      if (userId){
      return this._prismaService.customRole.findMany({
        where: { userId },
      });}
      else {
        return this._prismaService.customRole.findMany();
      }
    } catch {
      console.log('Ошибка при поиске роли');
      throw new HttpException('Ошибка при поиске роли', 500);
    }
  }
  public async deleteRole(id: string) {
    try {
      return this._prismaService.customRole.delete({
        where: { id },
      });
    } catch (error) {
      console.log('Ошибка при удалении роли');
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль не найдена', 404);
      }
      throw new HttpException('Ошибка при удалении роли', 500);
    }
  }
  public async updateRole(id: string, dto: TRoleUpdateDto) {
    const {name, userId} = dto
    try {
      return this._prismaService.customRole.update({
        where: { id },
        data: { name, userId },
      });
    } catch (error) {
      console.log('Ошибка при редактировании роли')
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль не найдена', 404);
      }
      throw new HttpException('Ошибка при редактировании роли', 500);
    }
  }
}
