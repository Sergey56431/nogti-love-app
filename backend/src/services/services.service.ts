import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
    Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateServicesDto, UpdateServicesDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  constructor(private _prismaService: PrismaService) {}

  async create(data: CreateServicesDto) {
    try {
      const categoryExists = await this._prismaService.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        this.logger.warn(`Категория с ID ${data.categoryId} не найдена при создании услуги`);
        throw new NotFoundException('Категория не найдена');
      }

      const service = await this._prismaService.services.create({ data });
      this.logger.log(`Услуга с ID ${service.id} успешно создана`);
      return service;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Ошибка при создании услуги ${CreateServicesDto}`, error.stack);
      throw new InternalServerErrorException('Ошибка создания услуги');
    }
  }

  async findAll() {
    try {
      const services = await this._prismaService.services.findMany();
      this.logger.log('Успешно получен список всех услуг');
      return services;
    } catch (error) {
      this.logger.error(`Ошибка при поиске всех услуг`, error.stack);
      throw new InternalServerErrorException('Ошибка поиска');
    }
  }

  async findOne(id: string) {
    try {
      const service = await this._prismaService.services.findUnique({ where: { id } });

      if (!service) {
        this.logger.warn(`Услуга с ID ${id} не найдена`);
        throw new HttpException('Услуга не найдена', 404);
      }

      this.logger.log(`Услуга с ID ${id} успешно найдена`);
      return service;
    } catch (error) {
      this.logger.error(`Ошибка при поиске услуги с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка поиска');
    }
  }

  async findByCategory(id: string) {
    try {
      const services = await this._prismaService.services.findMany({ where: { categoryId: id } });

      this.logger.log(`Найдено ${services.length} услуг для категории с ID ${id}`);

      return services;
    } catch (error) {
      this.logger.error(`Ошибка при поиске услуг для категории с ID ${id}`, error.stack);
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
          this.logger.warn(`Категория с ID ${data.categoryId} не найдена при обновлении услуги ${data}`);
          throw new NotFoundException('Категория не найдена');
        }
      }

      const service = await this._prismaService.services.findUnique({ where: { id } });

      if (!service) {
        this.logger.warn(`Услуга с ID ${id} не найдена при обновлении услуги ${data}`);
        throw new NotFoundException('Услуга не найдена');
      }

      const updatedService = await this._prismaService.services.update({
        where: { id },
        data,
      });

      this.logger.log(`Услуга с ID ${id} успешно обновлена ${data}`);
      return updatedService;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Ошибка при обновлении услуги с ID ${id} ${data}`, error.stack);
      throw new InternalServerErrorException('Ошибка обновления услуги');
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Удаление услуги с ID ${id}`);

      const result = await this._prismaService.services.delete({ where: { id } });

      this.logger.log(`Услуга с ID ${id} успешно удалена`);
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`Услуга с ID ${id} не найдена при удалении`);
        throw new HttpException('Услуга не найдена', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при удалении услуги с ID ${id}`, error.stack);
      throw new HttpException('Ошибка удаления услуги', 500);
    }
  }
}
