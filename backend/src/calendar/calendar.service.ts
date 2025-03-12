import { HttpException, Injectable } from '@nestjs/common';
import { UpdateCalendarDto } from './dto';
import { PrismaService } from '../prisma';
import { DayState } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLogger } from '../logger'; // Добавление кастомного логгера

@Injectable()
export class CalendarService {
  private readonly logger = new CustomLogger(); // Экземпляр кастомного логгера

  constructor(private readonly _prismaService: PrismaService) {}

  public async create(createCalendarDto) {
    try {
      const date = new Date(createCalendarDto.date);
      if (isNaN(date.getTime())) {
        this.logger.warn('Некорректная дата при создании дня календаря');
        throw new HttpException('Некорректная дата', 400);
      }
      this.logger.log(`Создание нового дня календаря на дату: ${date}`);
      return await this._prismaService.calendar.create({
        data: {
          date: date,
          state: createCalendarDto.state,
          creator: {
            connect: {
              id: createCalendarDto.userId.toString(),
            },
          },
        },
        include: {
          directs: true,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при создании дня календаря', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка при создании дня календаря', 500);
    }
  }

  public async create_all(data) {
    const { noWorkDays, userId } = data;
    if (!userId) {
      this.logger.warn('Отсутствует ID пользователя при создании календаря');
      throw new HttpException('Отсутствует ID пользователя', 400);
    }

    const now = new Date();

    const firstDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const lastDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));

    const daysMap = new Map<string, { state: DayState; userId: string }>();

    for (let date = new Date(firstDayOfMonth); date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().slice(0, 10); // Используем строку для ключа Map
      daysMap.set(dateString, { state: DayState.empty, userId });
    }

    for (const { date: dateString } of noWorkDays) {
      if (daysMap.has(dateString)) {
        daysMap.get(dateString)!.state = DayState.notHave;
      } else {
        this.logger.warn(`Дата ${dateString} не находится в текущем месяце`);
        throw new HttpException(`Дата ${dateString} не находится в текущем месяце`, 404);
      }
    }

    try {
      const daysToCreate = [...daysMap.entries()].map(
        ([dateString, { state, userId }]) => ({
          date: new Date(dateString),
          state,
          userId,
        }),
      );

      this.logger.log('Создание дней для календаря с учетом рабочих и нерабочих дней');
      return await this._prismaService.$transaction(
        daysToCreate.map((day) =>
          this._prismaService.calendar.upsert({
            where: {
              date: day.date,
              userId: day.userId,
            },
            update: { state: day.state },
            create: { date: day.date, state: day.state, userId: day.userId },
          }),
        ),
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.warn('Пользователь не найден при создании календаря');
        throw new HttpException('Пользователь не найден', 404);
      }
      this.logger.error('Ошибка при создании календаря', error.stack);
      throw new HttpException('Ошибка при создании календаря', 500);
    }
  }

  public async findAll() {
    try {
      this.logger.log('Поиск всех дней календаря');
      return await this._prismaService.calendar.findMany({
        include: {
          directs: true,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при поиске всего календаря', error.stack);
      throw new HttpException('Ошибка при поиске всего календаря', 500);
    }
  }

  public async findByUser(userId: string) {
    try {
      this.logger.log(`Поиск календаря для пользователя с ID ${userId}`);
      return await this._prismaService.calendar.findMany({
        where: { userId: userId },
        include: {
          directs: true,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при поиске календаря для пользователя', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при поиске календаря', 500);
    }
  }

  public async findOne(id: string) {
    try {
      this.logger.log(`Поиск дня календаря с ID ${id}`);
      const result = await this._prismaService.calendar.findFirst({
        where: {
          id,
        },
        include: {
          directs: true,
        },
      });
      if (!result) {
        this.logger.warn(`День календаря с ID ${id} не найден`);
        throw new HttpException('День не найден', 404);
      }

      return result;
    } catch (error) {
      this.logger.error('Ошибка при поиске дня календаря', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при поиске дня календаря', 500);
    }
  }

  public async findInterval(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        this.logger.warn('Некорректные даты для поиска интервала');
        throw new HttpException('Некорректная дата', 400);
      }

      this.logger.log(`Поиск дней в интервале с ${startDate} по ${endDate}`);
      return await this._prismaService.calendar.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при поиске интервала дней', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при поиске интервала дней', 500);
    }
  }

  public async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    try {
      this.logger.log(`Обновление дня календаря с ID ${id}`);
      return await this._prismaService.calendar.update({
        where: { id },
        data: { state: updateCalendarDto.state },
        include: {
          directs: {
            select: {
              id: true,
              phone: true,
              clientName: true,
              time: true,
              comment: true,
              userId: true,
              state: true,
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
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn('День календаря не найден при обновлении');
        throw new HttpException('День календаря не найден', 404);
      }
      this.logger.error('Ошибка при обновлении дня календаря', error.stack);
      throw new HttpException('Ошибка сервера при обновлении дня календаря', 500);
    }
  }

  public async remove(id: string) {
    try {
      this.logger.log(`Удаление дня календаря с ID ${id}`);
      return await this._prismaService.calendar.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn('День календаря не найден при удалении');
        throw new HttpException('День календаря не найден', 404);
      }
      this.logger.error('Ошибка при удалении дня календаря', error.stack);
      throw new HttpException('Ошибка сервера при удалении дня календаря', 500);
    }
  }
}
