import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly _prismaService: PrismaService) {}
  public async createRole(name: string, userId: string) {
    try {
      return this._prismaService.customRole.create({
        data: {
          name,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль уже существует', 409);
      }
      throw new HttpException('Ошибка при создании роли', 500);
    }
  }
  public async findAllRolesByUserID(userId: string) {
    try {
      return this._prismaService.customRole.findMany({
        where: { userId },
      });
    } catch {
      throw new HttpException('Ошибка при поиске роли', 500);
    }
  }
  public async deleteRole(id: string) {
    try {
      return this._prismaService.customRole.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль не найдена', 404);
      }
      throw new HttpException('Ошибка при удалении роли', 500);
    }
  }
  public async updateRole(id: string, name: string) {
    try {
      return this._prismaService.customRole.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Роль не найдена', 404);
      }
      throw new HttpException('Ошибка при редактировании роли', 500);
    }
  }
  public async findAllRoles() {
    try {
      return this._prismaService.customRole.findMany();
    } catch {
      throw new HttpException('Ошибка при поиске ролей', 500);
    }
  }
}
