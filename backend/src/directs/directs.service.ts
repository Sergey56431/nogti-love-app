import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Directs, DirectsState } from '@prisma/client';
import { CreateDirectDto } from './dto';
import { IDirectsService } from './interfaces';
import { ITimeSlotAlgorithm } from '../utilits/interfaces';
import { IDirectsServiceAlgorithm } from './interfaces/directs.service.algorithm.interface';
import {CustomLogger} from "../logger";

@Injectable()
export class DirectsService implements IDirectsService {
  private readonly logger = new CustomLogger();
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject('ITimeSlotAlgorithm')
    private readonly _timeSlotAlgorithm: ITimeSlotAlgorithm,
  ) {}

  public async findByDate(date: string) {
    try {
      const date_ = new Date(date);
      if (isNaN(date_.getTime())) {
        this.logger.log(`Пользователь ввел некорректную дату`);
        throw new HttpException('Некорректная дата', 400);
      }
      return await this._prismaService.directs.findMany({
        where: {
          calendar: {
            date: new Date(date),
          },
        },
        include: {
          services: {
            select: {
              service: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error('Ошибка при поиске по дате', error.stack);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async create(createDirectDto: CreateDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        this.logger.log(`Пользователь ввел некорректную дату`);
        throw new HttpException('Некорректная дата', 400);
      }

      const calendar = await this._prismaService.calendar.findFirst({
        where: { date: date },
      });

      const errors = [];

      if (!calendar) {
        errors.push(
          new HttpException(
            'Календарь для указанной даты не найден',
            404,
          ).getResponse(),
        );
      }
      if (
        !createDirectDto.userId ||
        !createDirectDto.phone ||
        !createDirectDto.clientName
      ) {
        errors.push(
          new HttpException(
            'Введите данные или id пользователя',
            400,
          ).getResponse(),
        );
      }
      if (!createDirectDto.services || !createDirectDto.services[0]) {
        errors.push(new HttpException('Выберите услуги', 400).getResponse());
      }

      if (errors.length > 0) {
        throw new HttpException({ errors: errors }, 400);
      }

      const newDirect = await this._timeSlotAlgorithm.bookSlot(
        createDirectDto.userId,
        createDirectDto.date,
        createDirectDto.time,
        createDirectDto.services.map((s) => s.serviceId),
        createDirectDto.clientName,
        createDirectDto.phone,
        createDirectDto.comment,
        calendar.id,
      );

      const servicePromises = newDirect.services.map(async (service) => {
        const serviceExists = await this._prismaService.services.findUnique({
          where: { id: service.serviceId },
        });
        if (!serviceExists) {
          this.logger.warn(`Услуга с ${service.serviceId} не найдена`);
          throw new HttpException(`Услуга не найдена`, 404);
        }
        return this._prismaService.directsServices.create({
          data: {
            serviceId: service.serviceId,
            directId: newDirect.directId,
          },
        });
      });

      await Promise.all(servicePromises);

      return this.findOne(newDirect.directId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this.logger.warn(`Ошибка при поиске пользователя`);
        throw new HttpException('Пользователь не найден', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при создании записи`, error);
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }

  public async findAll() {
    try {
      return await this._prismaService.directs.findMany();
    } catch (error) {
      console.log(error);
      this.logger.error('Ошибка при получении всех записей', error.stack);
      throw new HttpException('Ошибка сервера при получении всех записей', 500);
    }
  }

  public async findByUser(id: string) {
    try {
      return await this._prismaService.directs.findMany({
        where: { userId: id },
        include: {
          services: {
            select: {
              service: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error('Ошибка при поиске по дате', error.stack);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.directs.findUnique({
        where: { id },
        include: {
          services: {
            select: {
              service: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new HttpException('Запись не найдена', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error('Ошибка при поиске записи', error.stack);
      throw new HttpException('Ошибка при получении записи', 500);
    }
  }

  public async update(id: string, updateDirectDto) {
    try {
      const date = new Date(updateDirectDto.date);
      if (isNaN(date.getTime())) {
        this.logger.log(`Пользователь ввел некорректную дату`);
        throw new HttpException('Некорректная дата', 400);
      }
      const calendarId = await this._prismaService.calendar.findUnique({
        where: {
          date_userId: {
            date: date,
            userId: updateDirectDto.userId,
          },
        },
        select: { id: true },
      });
      if (!calendarId) {
        this.logger.warn('Пользователь ввел неверную дату');
        throw new HttpException('Календарь для указанной даты не найден', 404);
      }

      if (
        updateDirectDto.state &&
        !Object.values(DirectsState).includes(updateDirectDto.state)
      ) {
        this.logger.log('Неверный статус записи');
        throw new HttpException('Ошибка статуса записи', 400);
      }

      const updateDirect = { ...updateDirectDto };
      delete updateDirect.services;
      delete updateDirect.date;

      const direct = await this._prismaService.directs.update({
        where: { id: id },
        data: {
          ...updateDirect,
          calendarId: calendarId.id,
        },
      });

      if (updateDirectDto.services) {
        const serviceCheckPromises = updateDirectDto.services.map(
          async (service) => {
            const serviceExists = await this._prismaService.services.findUnique(
              {
                where: { id: service.serviceId },
              },
            );
            if (!serviceExists) {
              this.logger.warn('Услуга не найдена');
              throw new HttpException(`Ошибка сервера при поиске услуги`, 404);
            }
          },
        );

        await Promise.all(serviceCheckPromises);

        await this._prismaService.directsServices.deleteMany({
          where: {
            directId: direct.id,
          },
        });

        const servicePromises = updateDirectDto.services.map(
          async (service) => {
            return await this._prismaService.directsServices.create({
              data: {
                serviceId: service.serviceId,
                directId: direct.id,
              },
            });
          },
        );

        await Promise.all(servicePromises);
      }

      return await this.findOne(direct.id);
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn('Запись не найдена');
        throw new HttpException(`Ошибка сервера при поиске записи`, 404);
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this.logger.warn('Пользователь не найден');
        throw new HttpException(`Ошибка сервера при поиске пользователя`, 404);
      }
      console.log(error);
      this.logger.error('Ошибка при создании записи', error.stack);
      throw new HttpException('Ошибка при обновлении записи', 500);
    }
  }

  public async remove(id: string) {
    try {
      return await this._prismaService.directs.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn('Запись не найдена');
        throw new HttpException(`Ошибка сервера при поиске записи`, 404);
      }
      console.log(error);
      this.logger.error('Ошибка при удалении записи', error);
      throw new Error('Ошибка при удалении данных');
    }
  }
}

@Injectable()
export class DirectsServiceForAlgorithm implements IDirectsServiceAlgorithm{
  private readonly logger = new CustomLogger();
  constructor(private readonly _prismaService: PrismaService) {}
  public async findByDateUser(userId: string, date: Date): Promise<any> {
    try {
      return await this._prismaService.directs.findMany({
        where: {
          userId: userId,
          calendar: {
            date: date,
          },
          state: {
            not: 'cancelled',
          },
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      this.logger.error('Ошибка при получении записей', error.stack);
      throw new HttpException('Ошибка сервера при получении записей', 500);
    }
  }

  public async createDirect(
    createDirect: CreateDirectDto,
    calendarId: string,
  ): Promise<Directs> {
    try {
      return await this._prismaService.directs.create({
        data: {
          userId: createDirect.userId.toString(),
          time: createDirect.time.toString(),
          clientName: createDirect.clientName.toString(),
          phone: createDirect.phone.toString(),
          comment: createDirect.comment.toString(),
          calendarId: calendarId,
          state: createDirect.state,
        },
      });
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
      throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
  }
}
