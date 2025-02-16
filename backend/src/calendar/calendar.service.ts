import { HttpException, Injectable } from '@nestjs/common';
import { UpdateCalendarDto } from './dto';
import { PrismaService } from '../prisma';
import { DayState } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CalendarService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async create(createCalendarDto) {
    try {
      const date = new Date(createCalendarDto.date);
      if (isNaN(date.getTime())) {
        throw new HttpException('Некорректная дата', 400);
      }
      console.log(date);
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
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка при создании дня календаря', 500);
    }
  }

  public async create_all(data) {
    const { noWorkDays, userId } = data;
    if (!userId) {
      throw new HttpException('Отсутствует ID пользователя', 400);
    }

    const now = new Date();

    const firstDayOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1),
    );
    const lastDayOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 0),
    );

    const daysMap = new Map<string, { state: DayState; userId: string }>();

    for (
      let date = new Date(firstDayOfMonth);
      date <= lastDayOfMonth;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().slice(0, 10); // Используем строку для ключа Map
      daysMap.set(dateString, { state: DayState.empty, userId });
    }

    for (const { date: dateString } of noWorkDays) {
      if (daysMap.has(dateString)) {
        daysMap.get(dateString)!.state = DayState.notHave;
      } else {
        throw new HttpException(
          `Дата ${dateString} не находится в текущем месяце`,
          404,
        );
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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        throw new HttpException('Пользователь не найден', 404);
      }
      console.error('Ошибка при создании календаря:', error);
      throw new HttpException('Ошибка при создании календаря', 500);
    }
  }

  public async findAll() {
    try {
      return await this._prismaService.calendar.findMany({
        include: {
          directs: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка при поиске всего календаря', 500);
    }
  }

  public async findByUser(userId: string) {
    try {
      return await this._prismaService.calendar.findMany({
        where: { userId: userId },
        include: {
          directs: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске календаря', 500);
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.calendar.findFirst({
        where: {
          id,
        },
        include: {
          directs: true,
        },
      });
      if (!result) {
        throw new HttpException('День не найден', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске дня календаря', 500);
    }
  }

  public async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    try {
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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('День календаря не найден', 404);
      }
      console.log(error);
      throw new HttpException(
        'Ошибка сервера при обновлении дня календаря',
        500,
      );
    }
  }

  public async remove(id: string) {
    try {
      return await this._prismaService.calendar.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('День каледнаря не найден', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при удалении дня календаря', 500);
    }
  }
}
