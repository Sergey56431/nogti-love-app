import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private _prismaService: PrismaService) {}

  async create(data: CreateCategoryDto) {
    try {
      const errors = [];

      if (!data.userId) {
        errors.push(
          new HttpException('Нет ID пользователя', 400).getResponse(),
        );
      }
      if (!data.name) {
        errors.push(
          new HttpException('Нет названия операции', 400).getResponse(),
        );
      }
      if (errors[0]) {
        throw new HttpException({ errors, status: 400 }, 400);
      }
      return await this._prismaService.category.create({
        data: {
          name: data.name,
          userId: data.userId,
        },
        include: {
          services: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при категории', 500);
    }
  }

  async findAll() {
    try {
      return await this._prismaService.category.findMany();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске всех категорий', 500);
    }
  }

  async findOne(id: string) {
    try {
      const result = await this._prismaService.category.findUnique({
        where: { id },
      });

      if (!result) {
        throw new HttpException('Категория не найдена', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске категории', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      return await this._prismaService.category.findMany({
        where: { userId },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске категории', 500);
    }
  }

  async update(id: string, data: UpdateCategoryDto) {
    try {
      return await this._prismaService.category.update({
        where: { id },
        data: {
          name: data.name,
          userId: data.userId,
        },
        include: {
          services: true,
        },
      });
    } catch (error) {
      console.log(error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Категория не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при обновлении категории', 500);
    }
  }

  async remove(id: string) {
    try {
      return await this._prismaService.category.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Категория не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при удалении категории', 500);
    }
  }
}
