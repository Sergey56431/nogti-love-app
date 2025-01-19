import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import {CreateDirectDto, UpdateDirectDto} from './dto';
import {PrismaService} from "../prisma";


@Injectable()
export class DirectsService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async findByDate(date: string) {
    try {
      return await this._prismaService.directs.findMany({
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
    } catch (error) {
      console.error('Ошибка при поиске по дате:', error);
      throw new Error('Ошибка при поиске данных');
    }
  }

  public async create(createDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Некорректная дата');
      }

      const calendar = await this._prismaService.calendar.findFirst({
        where: {date: date},
      });

      if (!calendar) {
        throw new NotFoundException('Календарь не найден для указанной даты');
      } else if (!createDirectDto.userId && (!createDirectDto.phone || !createDirectDto.clientName)) {
        throw new BadRequestException('Введите данные или id пользователя');
      } else if (!createDirectDto.services || !createDirectDto.services[0]) {
        throw new BadRequestException('Выберите услуги')
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
          throw new NotFoundException(`Услуга не найдена`);
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
      if (error instanceof HttpException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        console.error('Ошибка при создании записи:', error);
        throw new InternalServerErrorException('Внутренняя ошибка сервера');
      }
    }
  }

  public async findAll() {
    return this._prismaService.directs.findMany();
  }

  public async findByUser(id: string) {
    try {
      return  await this._prismaService.directs.findMany({
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
    } catch (error) {
      console.error('Ошибка при получении всех записей:', error);
      throw new Error('Ошибка при получении данных');
    }
  }

  public async findOne(id: string) {
    try {
      return await this._prismaService.directs.findUnique({
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
    } catch (error) {
      console.error('Ошибка при поиске записи:', error);
      throw new Error('Ошибка при поиске данных');
    }
  }

  public async update(id: string, updateDirectDto) {
    try {
      const calendarId = await this._prismaService.calendar.findUnique({
        where: {date: new Date(updateDirectDto.date)},
        select: {id: true}
      });
      if (!calendarId) {
        throw new NotFoundException('Календарь не найден для указанной даты');
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
            throw new NotFoundException(`Услуга не найдена`);
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
      } else {
        console.error('Ошибка при создании записи:', error);
        throw new InternalServerErrorException('Внутренняя ошибка сервера');
      }
    }
  }

  public async remove(id: string) {
    try {
      await this._prismaService.directs.delete({
        where: { id },
      });
      return true
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      throw new Error('Ошибка при удалении данных');
    }
  }
}