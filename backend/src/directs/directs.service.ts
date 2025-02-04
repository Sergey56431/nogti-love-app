import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {CreateDirectDto, UpdateDirectDto} from './dto';
import {PrismaService} from "../prisma";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {DirectsState} from "@prisma/client"

@Injectable()
export class DirectsService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async findByDate(date: string) {
    try {
      const result = await this._prismaService.directs.findMany({
        where: {
          calendar: {
            date: new Date(date),
          },
        },
        include: {
          services: {
            select:{
              service: {
                include: {
                  category:{
                    select:{
                      name:true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              name: true,
              lastName:true,
              phoneNumber: true,
            }
          }
        }
      });

      if (!result[0]){
        throw new HttpException('Записи не найдены', 404)
      }

      return result;

    } catch (error) {
      if (error instanceof HttpException){
        throw error;
      }
      console.error('Ошибка при поиске по дате:', error);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async create(createDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        throw new HttpException('Некорректная дата', 400);
      }

      const calendar = await this._prismaService.calendar.findFirst({
        where: {date: date},
      });

      let errors = [];

      if (!calendar) {
        errors.push(new HttpException('Календарь для указанной даты не найден', 404).getResponse());
      }
      if (!createDirectDto.userId && (!createDirectDto.phone || !createDirectDto.clientName)) {
        errors.push(new HttpException('Введите данные или id пользователя', 400).getResponse());
      }
      if (!createDirectDto.services || !createDirectDto.services[0]) {
        errors.push(new HttpException('Выберите услуги', 400).getResponse());
      }

      if (errors.length > 0) {
        throw new HttpException({errors: errors}, 400);
      }


      const createDirect = {...createDirectDto}
      delete createDirect.services;
      delete createDirect.date;


      const direct = await this._prismaService.directs.create({
        data: {
          ...createDirect,
          calendarId: calendar.id,
        }
      });

      const servicePromises = createDirectDto.services.map(async (service) => {
        const serviceExists = await this._prismaService.services.findUnique({
          where: { id: service.serviceId },
        });
        if (!serviceExists) {
          throw new HttpException(`Услуга не найдена`,404);
        }
        return this._prismaService.directsServices.create({
          data: {
            serviceId: service.serviceId,
            directId: direct.id,
          },
        });
      });

      await Promise.all(servicePromises);

      return this.findOne(direct.id);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError && error.code == 'P2003'){
        throw new HttpException('Пользователь не найден', 404)
      }
      console.error('Ошибка при создании записи:', error);
      throw new InternalServerErrorException('Внутренняя ошибка сервера');

    }
  }

  public async findAll() {
    try {
      return this._prismaService.directs.findMany();
    } catch (error) {
      console.error('Ошибка при получении всех записей:', error);
      throw new HttpException('Ошибка при получении всех записей', 500);
    }

  }

  public async findByUser(id: string) {
    try {
      const result = await this._prismaService.directs.findMany({
        where: {userId: id},
        include: {
          services: {
            select:{
              service: {
                include: {
                  category:{
                    select:{
                      name:true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              name: true,
              lastName:true,
              phoneNumber: true,
            }
          }
        }
      })

      if (!result[0]){
        throw new HttpException('Записи не найдены', 404)
      }

      return result;

    }  catch (error) {
      if (error instanceof HttpException){
        throw error;
      }
      console.error('Ошибка при поиске по дате:', error);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.directs.findUnique({
        where: { id },
        include: {
          services: {
            select:{
              service: {
                include: {
                  category:{
                    select:{
                      name:true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              name: true,
              lastName:true,
              phoneNumber: true,
            }
          }
        }
      });

      if (!result){
        throw new HttpException('Запись не найдена', 404)
      }

      return result;

    } catch (error) {
      if (error instanceof HttpException){
        throw error;
      }
      console.error('Ошибка при поиске записи:', error);
      throw new HttpException('Ошибка при получении записи', 500);
    }
  }

  public async update(id: string, updateDirectDto) {
    try {
      const date = new Date(updateDirectDto.date)
      if (isNaN(date.getTime())) {
        throw new HttpException('Некорректная дата', 400);
      }
      const calendarId = await this._prismaService.calendar.findUnique({
        where: {date: date},
        select: {id: true}
      });
      if (!calendarId) {
        throw new HttpException('Календарь для указанной даты не найден', 404);
      }

      if (
          updateDirectDto.state !== DirectsState.notConfirmed &&
          updateDirectDto.state !== DirectsState.confirmed &&
          updateDirectDto.state !== DirectsState.cancelled
      ) {
        throw new HttpException('Неверный статус записи', 400);
      }

      const updateDirect = {...updateDirectDto}
      delete updateDirect.services;
      delete updateDirect.date;

      const direct = await this._prismaService.directs.update({
        where: {id},
        data: {
          ...updateDirect,
          calendarId: calendarId.id,
        },
      });

      if (updateDirectDto.services) {
        const serviceCheckPromises = updateDirectDto.services.map(async (service) => {
          const serviceExists = await this._prismaService.services.findUnique({
            where: {id: service.serviceId},
          });
          if (!serviceExists) {
            throw new HttpException(`Услуга не найдена`, 404);
          }
        });

        await Promise.all(serviceCheckPromises);

        await this._prismaService.directsServices.deleteMany({
          where: {
            directId: direct.id,
          }
        })

        const servicePromises = updateDirectDto.services.map(async (service) => {
          return this._prismaService.directsServices.create({
            data: {
              serviceId: service.serviceId,
              directId: direct.id,
            },
          });
        });

        await Promise.all(servicePromises);
      }

      return this.findOne(direct.id);

    } catch (error) {
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError && error.code == 'P2025') {
        throw new HttpException('Запись не найдена', 404)
      }
      if (error instanceof PrismaClientKnownRequestError && error.code == 'P2003') {
        throw new HttpException('Пользователь не найден', 404)
      }
      console.error('Ошибка при создании записи:', error);
      throw new HttpException('Ошибка при обновлении записи',500);

    }
  }

  public async remove(id: string) {
    try {
      return await this._prismaService.directs.delete({
        where: { id },
      });
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError && error.code == 'P2025'){
        throw new HttpException('Запись не найдена', 404)
      }
      console.error('Ошибка при удалении записи:', error);
      throw new Error('Ошибка при удалении данных');
    }
  }
}