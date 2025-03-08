import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { CreateCategoryOperationsDto, UpdateCategoryOperationsDto } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateCategoryDto } from '../categories/dto';

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
  async findAll() {
    try {
      return await this._prismaService.categoryOperations.findMany();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске всех категории операции', 500);
    }
  }
  async findOne(id: string) {
    try {
      const result = await this._prismaService.categoryOperations.findUnique({
        where: { id },
      });

      if (!result) {
        throw new HttpException('Категория операции не найдена', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске категории операции', 500);
    }
  }
  async findByUser(userId: string) {
    try {
      return await this._prismaService.categoryOperations.findMany({
        where: { userId },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске категории операции', 500);
    }
  }
  async update(id: string, data: UpdateCategoryOperationsDto) {
    try {
      return await this._prismaService.categoryOperations.update({
        where: { id },
        data: {
          name: data.name,
          userId: data.userId,
        },
      });
    } catch (error) {
      console.log(error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Категория операции не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при обновлении категории операции', 500);
    }
  }
  async remove(id: string) {
    try {
      return await this._prismaService.categoryOperations.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Категория операции не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при удалении категории операции', 500);
    }
  }
}
