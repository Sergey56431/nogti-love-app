import { Injectable, Logger } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import {
  CreateCategoryOperationsDto,
  UpdateCategoryOperationsDto,
} from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ICategoryOperationsService } from './interfaces';

@Injectable()
export class CategoryOperationsService implements ICategoryOperationsService {
  private readonly logger = new Logger(CategoryOperationsService.name);

  constructor(private readonly _prismaService: PrismaService) {}

  async create(data: CreateCategoryOperationsDto) {
    try {
      const errors = [];

      if (!data.userId) {
        this.logger.warn(
          `Нет ID пользователя для создания категории операций, ${data}`,
        );
        errors.push(
          new HttpException('Нет ID пользователя', 400).getResponse(),
        );
      }
      if (!data.name) {
        this.logger.warn(
          `Нет названия категорий операций для создания категории операций, ${data}`,
        );
        errors.push(
          new HttpException(
            'Нет названия категорий операций',
            400,
          ).getResponse(),
        );
      }
      if (errors.length > 0) {
        throw new HttpException({ errors, status: 400 }, 400);
      }

      const createdCategoryOperation =
        await this._prismaService.categoryOperations.create({
          data: {
            name: data.name,
            userId: data.userId,
          },
        });

      this.logger.log(
        `Категория операции ${createdCategoryOperation} успешно создана для пользователя с ID ${data.userId}`,
      );
      return createdCategoryOperation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this.logger.warn(
          `Пользователь ${data.userId} не найден при создании категории ${data}`,
        );
        throw new HttpException('Пользователь не найден', 404);
      }
      console.error(error);
      this.logger.error(
        `Пользователь ${data.userId} ввел неверные данные для создания категории операции`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при создании категории операций',
        500,
      );
    }
  }

  async findAll() {
    try {
      const categoryOperations =
        await this._prismaService.categoryOperations.findMany();
      this.logger.log('Успешно получены все категории операций');
      return categoryOperations;
    } catch (error) {
      console.error(error);
      this.logger.error(
        `Ошибка при поиске всех категорий операций`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при поиске всех категорий операций',
        500,
      );
    }
  }

  async findOne(id: string) {
    try {
      const result = await this._prismaService.categoryOperations.findUnique({
        where: { id },
      });

      if (!result) {
        this.logger.warn(`Категория операции с ID ${id} не найдена`);
        throw new HttpException('Категория операции не найдена', 404);
      }

      this.logger.log(`Категория операции с ID ${id} успешно найдена`);
      return result;
    } catch (error) {
      console.error(error);
      this.logger.error(
        `Ошибка при поиске категории операции с ID ${id}`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при поиске категории операции',
        500,
      );
    }
  }

  async findByUser(userId: string) {
    try {
      const categoryOperations =
        await this._prismaService.categoryOperations.findMany({
          where: { userId },
        });

      if (categoryOperations.length === 0) {
        this.logger.warn(
          `Категории операции для пользователя с ID ${userId} не найдены`,
        );
        throw new HttpException('Категории операции не найдены', 404);
      }

      this.logger.log(
        `Успешно найдены категории операции для пользователя с ID ${userId}`,
      );
      return categoryOperations;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      this.logger.error(
        `Ошибка при поиске категорий операции пользователя с ID ${userId}`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при поиске категорий операции пользователя',
        500,
      );
    }
  }

  async update(id: string, data: UpdateCategoryOperationsDto) {
    try {
      const updatedCategoryOperation =
        await this._prismaService.categoryOperations.update({
          where: { id },
          data: {
            name: data.name,
            userId: data.userId,
          },
        });

      this.logger.log(
        `Категория операции с ID ${id} успешно обновлена, ${data}`,
      );
      return updatedCategoryOperation;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(
          `Категория операции с ID ${id} не найдена при обновлении ${data}`,
        );
        throw new HttpException('Категория операции не найдена', 404);
      }
      console.error(error);
      this.logger.error(
        `Пользователь ${data.userId} ввел неверные данные для обновления категории операции ${id}`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при обновлении категории операции',
        500,
      );
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Удаление категории операции с ID ${id}`);
      return await this._prismaService.categoryOperations.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(
          `Категория операции с ID ${id} не найдена при удалении`,
        );
        throw new HttpException('Категория операции не найдена', 404);
      }
      console.error(error);
      this.logger.error(
        `Ошибка при удалении категории операции с ID ${id}`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка сервера при удалении категории операции',
        500,
      );
    }
  }
}
