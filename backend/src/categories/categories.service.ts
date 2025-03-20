import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ICategoryServices } from './interfaces';
import {CustomLogger} from "../logger";

@Injectable()
export class CategoryService implements ICategoryServices {
  private readonly logger = new CustomLogger();
  constructor(private readonly _prismaService: PrismaService) {}

  async create(data: CreateCategoryDto) {
    try {
      const errors = [];

      if (!data.userId) {
        this.logger.warn(
          `При создании категории услуг отстутствовало ID пользователя ${data}`,
        );
        errors.push(
          new HttpException('Нет ID пользователя', 400).getResponse(),
        );
      }
      if (!data.name) {
        this.logger.warn(
          `При создании категории услуг отстутствовало название ${data}`,
        );
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
      } else {
        console.log(error);
        this.logger.error(
          `Ошибка при создании категории услуг ${data} пользователем ${data.userId}`,
          error,
        );
        throw new HttpException('Ошибка сервера при создании категории', 500);
      }
    }
  }

  async findAll() {
    try {
      return await this._prismaService.category.findMany();
    } catch (error) {
      console.log(error);
      this.logger.error('Ошибка при поиске всех категорий', error);
      throw new HttpException('Ошибка сервера при поиске всех категорий', 500);
    }
  }

  async findOne(id: string) {
    try {
      const result = await this._prismaService.category.findUnique({
        where: { id },
      });

      if (!result) {
        this.logger.warn(`Категория с ID ${id} не найдена`);
        throw new HttpException('Категория не найдена', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(`Ошибка при поиске категории ${id}`, error);
      throw new HttpException('Ошибка сервера при поиске категории', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      return await this._prismaService.category.findMany({
        where: { userId },
        include: { services: true },
      });
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Ошибка при поиске категорий по пользователю ${userId}`,
        error,
      );
      throw new HttpException('Ошибка сервера при поиске категорий', 500);
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
      this.logger.error(
        `Ошибка при обновлении категории c ID ${id}, ${data}`,
        error,
      );
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(
          `Категория c ID ${id}, ${data} не найдена при обновлении`,
        );
        throw new HttpException('Категория не найдена', 404);
      }
      console.log(error);
      this.logger.error(
        `Ошибка при обновлении категории c ID ${id}, ${data}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при обновлении категории', 500);
    }
  }

  async remove(id: string) {
    try {
      return await this._prismaService.category.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Ошибка при удалении категории ${id}`, error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(`Категория ${id} не найдена при удалении`);
        throw new HttpException('Категория не найдена', 404);
      }
      console.log(error);
      this.logger.error('Ошибка при удалении категории', error.stack);
      throw new HttpException('Ошибка сервера при удалении категории', 500);
    }
  }
}
