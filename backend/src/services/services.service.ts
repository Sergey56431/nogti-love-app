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
import { CustomLogger } from '../logger';

@Injectable()
export class ServicesService {
  private readonly logger = new CustomLogger();

  constructor(private _prismaService: PrismaService) {}

  async create(data: CreateServicesDto) {
    try {
      const categoryExists = await this._prismaService.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException('Категория не найдена');
      }

      const service = await this._prismaService.services.create({
        data: { ...data },
      });

      this.logger.log(`Услуга с ID ${service.id} успешно создана`);
      return service;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Ошибка создания услуги', error.stack);
      throw new InternalServerErrorException('Ошибка создания услуги');
    }
  }

  async findAll() {
    try {
      const services = await this._prismaService.services.findMany();
      this.logger.log('Все услуги успешно получены');
      return services;
    } catch (error) {
      this.logger.error('Ошибка поиска всех услуг', error.stack);
      throw new InternalServerErrorException('Ошибка поиска');
    }
  }

  async findOne(id: string) {
    try {
      const service = await this._prismaService.services.findUnique({
        where: { id },
      });
      if (!service) {
        throw new NotFoundException('Услуга не найдена');
      }

      this.logger.log(`Услуга с ID ${id} успешно найдена`);
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Ошибка поиска услуги с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка поиска');
    }
  }

  async findByCategory(id: string) {
    try {
      const services = await this._prismaService.services.findMany({
        where: { categoryId: id },
      });

      this.logger.log(`Все услуги для категории с ID ${id} успешно получены`);
      return services;
    } catch (error) {
      this.logger.error(`Ошибка поиска услуг для категории с ID ${id}`, error.stack);
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
          throw new NotFoundException('Категория не найдена');
        }
      }

      const service = await this._prismaService.services.findUnique({
        where: { id },
      });
      if (!service) {
        throw new NotFoundException('Услуга не найдена');
      }

      const updatedService = await this._prismaService.services.update({
        where: { id },
        data: { ...data },
      });

      this.logger.log(`Услуга с ID ${id} успешно обновлена`);
      return updatedService;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Ошибка обновления услуги с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка обновления услуги');
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
        this.logger.warn(`Попытка удалить несуществующую услугу с ID ${id}`);
        throw new NotFoundException('Услуга не найдена');
      }

      this.logger.error(`Ошибка удаления услуги с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка удаления услуги');
    }
  }
}
