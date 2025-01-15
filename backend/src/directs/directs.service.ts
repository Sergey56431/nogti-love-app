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
      });
    } catch (error) {
      console.error('Ошибка при поиске по дате:', error);
      throw new Error('Ошибка при поиске данных');
    }
  }

  public async create(createDirectDto: CreateDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Некорректная дата');
      }

      const calendar = await this._prismaService.calendar.findFirst({
        where: { date: date },
      });

      if (!calendar) {
        throw new NotFoundException('Календарь не найден для указанной даты');
      } else if (!createDirectDto.userId && (!createDirectDto.phone || !createDirectDto.clientName)) {
        throw new BadRequestException('Введите данные или id пользователя');
      }

      delete createDirectDto.date;

      return await this._prismaService.directs.create({
        data: {
          ...createDirectDto,
          calendarId: calendar.id,
        },
        include: {
          user: {
            select: {
              name: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      } else {
        console.error('Ошибка при создании записи:', error);
        throw new InternalServerErrorException('Внутренняя ошибка сервера');
      }
    }
  }

  public async findAll(id: string) {   // Подлежит переработке для оптимизации
    try {
      return  await this._prismaService.directs.findMany({
        where: {userId: id},
        include: {
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

  public async update(id: string, updateDirectDto: UpdateDirectDto) {
    try {
      const calendarId = await this._prismaService.calendar.findUnique({
        where: {date: new Date(updateDirectDto.date)},
        select: {id: true}
      });
      if (!calendarId) {
        throw new NotFoundException('Календарь не найден для указанной даты');
      }

      delete updateDirectDto.date;

      return await this._prismaService.directs.update({
        where: {id},
        data: {
          ...updateDirectDto,
          calendarId: calendarId.id,
        },
        include: {
          user: {
            select: {
              name: true,
              lastName: true,
              phoneNumber: true,
            }
          }
        }
      });
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