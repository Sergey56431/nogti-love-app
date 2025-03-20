import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateServicesDto, UpdateServicesDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IServicesService } from './interfaces';
import {CustomLogger} from "../logger";

@Injectable()
export class ServicesService implements IServicesService {
  private readonly logger = new CustomLogger();
  constructor(private _prismaService: PrismaService) {}

  async create(data: CreateServicesDto) {
    try {
      const categoryExists = await this._prismaService.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        this.logger.warn(
          `Категория с ID ${data.categoryId} не найдена при создании услуги`,
        );
        throw new HttpException('Категория не найдена', 404);
      }

      const service = await this._prismaService.services.create({
        data: { ...data },
      });
      this.logger.log(`Услуга с ID ${service.id} успешно создана`);
      return service;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.log('Ошибка создания услуги:', error);
      this.logger.error(
        `Ошибка при создании услуги ${CreateServicesDto}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера создания услуги', 500);
    }
  }

  async findAll() {
    try {
      const services = await this._prismaService.services.findMany();
      this.logger.log('Успешно получен список всех услуг');
      return services;
    } catch (error) {
      console.log(error);
      this.logger.error(`Ошибка при поиске всех услуг`, error.stack);
      throw new HttpException('Ошибка сервера при поиске', 500);
    }
  }

  async findOne(id: string) {
    try {
      const service = await this._prismaService.services.findUnique({
        where: { id },
      });
      if (!service) {
        this.logger.warn(`Услуга с ID ${id} не найдена`);
        throw new HttpException('Услуга не найдена', 404);
      }

      this.logger.log(`Услуга с ID ${id} успешно найдена`);
      return service;
    } catch (error) {
      console.log(error);
      this.logger.error(`Ошибка при поиске услуги с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске', 500);
    }
  }

  async findByCategory(id: string) {
    try {
      const services = await this._prismaService.services.findMany({
        where: { categoryId: id },
      });

      this.logger.log(
        `Найдено ${services.length} услуг по категории с ID ${id}`,
      );

      return services;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Ошибка при поиске услуг по категории с ID ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Ошибка поиска');
    }
  }

  async update(id: string, data: UpdateServicesDto) {
    try {
      if (data.categoryId) {
        const categoryExists = await this._prismaService.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!categoryExists) {
          this.logger.warn(
            `Категория с ID ${data.categoryId} не найдена при обновлении услуги ${data}`,
          );
          throw new HttpException('Категория не найдена', 404);
        }
      }

      const service = await this._prismaService.services.findUnique({
        where: { id },
      });
      if (!service) {
        this.logger.warn(
          `Услуга с ID ${id} не найдена при обновлении услуги ${data}`,
        );
        throw new HttpException('Услуга не найдена', 404);
      }

      const updatedService = await this._prismaService.services.update({
        where: { id },
        data: { ...data },
      });

      this.logger.log(`Услуга с ID ${id} успешно обновлена \n${data}`);
      return updatedService;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.log(error);
      this.logger.error(
        `Ошибка при обновлении услуги с ID ${id} \n ${data}`,
        error.stack,
      );
      throw new HttpException('Ошибка обновления услуги', 500);
    }
  }

  async remove(id: string) {
    try {
      const result = await this._prismaService.services.delete({
        where: { id },
      });
      this.logger.log(`Услуга с ID ${id} успешно удалена`);
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Услуга с ID ${id} не найдена при удалении`);
        throw new HttpException('Услуга не найдена', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при удалении услуги с ID ${id}`, error.stack);
      throw new HttpException('Ошибка удаления услуги', 500);
    }
  }
}
