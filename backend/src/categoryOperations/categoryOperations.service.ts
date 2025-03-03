import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { CreateCategoryOperationsDto } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryOperationsService {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(data: CreateCategoryOperationsDto) {
    try {
      const errors = [];

      if (!data.userId) {
        errors.push(new HttpException('Нет ID пользователя', 400).getResponse());
      }
      if (!data.name) {
        errors.push(new HttpException('Нет названия категорий операций', 400).getResponse());
      }
      if (errors.length > 0) {
        throw new HttpException({ errors, status: 400 }, 400);
      }

      return await this._prismaService.categoryOperations.create({
        data: {
          name: data.name,
          userId: data.userId,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError && error.code == "P2003") {
        throw new HttpException('Пользователь не найден', 404);
      }

      console.error(error);
      throw new HttpException('Ошибка сервера при создании категории операций', 500);
    }
  }
}
