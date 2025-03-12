import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLogger } from '../logger';

@Injectable()
export class CategoryService {
  private readonly logger = new CustomLogger();

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

      const createdCategory  = await this._prismaService.category.create({
        data: {
          name: data.name,
          userId: data.userId,
        },
        include: {
          services: true,
        },
      });

      this.logger.log(`Пользователь ${createdCategory.userId} успешно создал ${createdCategory.id} категорию услуг`);
      return createdCategory ;
    } catch (error) {

      if (error instanceof HttpException) {
        this.logger.warn('Некорректные данные для создания категории');
        throw error;
      }
      this.logger.error(`Ошибка при создании категории услуг пользователем ${data.userId}`, error.stack);
      throw new HttpException(`Ошибка при создании категории услуг`, 500);
    }

  }


  async findAll() {
    try {
      const categories = await this._prismaService.category.findMany();
      this.logger.log('Успешно получены все категории');
      return categories;
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.warn('Некорректные данные для поиска категорий');
        throw error;
      }
      this.logger.error('Ошибка при поиске всех категорий', error.stack);
      throw new HttpException('Ошибка сервера при поиске всех категорий', 500);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this._prismaService.category.findUnique({
        where: { id },
      });

      if (!category) {
        this.logger.warn(`Категория с ID ${id} не найдена`);
        throw new HttpException('Категория не найдена', 404);
      }

      this.logger.log(`Категория с ID ${id} успешно найдена`);
      return category;
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.warn('Некорректные данные для поиска категории');
        throw error;
      }
      this.logger.error(`Ошибка при поиске категории с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске категории', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      const categories = await this._prismaService.category.findMany({
        where: { userId },
      });

      if (categories.length === 0) {
        this.logger.warn(`Категории для пользователя с ID ${userId} не найдены`);
        throw new HttpException('Категории не найдены', 404);
      }

      this.logger.log(`Успешно найдены категории для пользователя с ID ${userId}`);
      return categories;
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.warn('Некорректные данные для поиска категорий пользователя');
        throw error;
      }
      this.logger.error(`Ошибка при поиске категорий пользователя с ID ${userId}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске категорий пользователя', 500);
    }
  }

  async update(id: string, data: UpdateCategoryDto) {
    try {
      const updatedCategory = await this._prismaService.category.update({
        where: { id },
        data: {
          name: data.name,
          userId: data.userId,
        },
        include: {
          services: true,
        },
      });

      this.logger.log(`Категория с ID ${id} успешно обновлена`);
      return updatedCategory;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`Категория с ID ${id} не найдена`);
        throw new HttpException('Категория не найдена', 404);
      }

      this.logger.error(`Ошибка при обновлении категории с ID ${id}`, error.stack);
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
