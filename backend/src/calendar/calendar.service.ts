import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { UpdateCalendarDto } from './dto';
import { PrismaService } from '../prisma';
import { DayState } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TimeSlotAlgorithm } from '../utilits';
import { FreeSlotService } from '../freeSlots';
import { CreateCalendarAllDto } from './dto/create-calendar-all.dto';
import { SettingsService } from '../settings';

@Injectable()
export class CalendarService {
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject(forwardRef(() => TimeSlotAlgorithm)) // Правильно
    private readonly _timeSlotAlgorithm: TimeSlotAlgorithm,
    @Inject(forwardRef(() => FreeSlotService)) // Правильно
    private readonly _freeSlotService: FreeSlotService,
    private readonly _settingsService: SettingsService,
  ) {}

  private _validateDateForCreate(year: number, month: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new HttpException(
        'Нельзя создать календарь на прошедший месяц',
        400,
      );
    }
  }

  private _validateNoWorkDay(dateString: string, year: number, month: number) {
    const dateParts = dateString.split('-');
    const yearFromDate = parseInt(dateParts[0], 10);
    const monthFromDate = parseInt(dateParts[1], 10);
    const dayFromDate = parseInt(dateParts[2], 10);

    if (isNaN(yearFromDate) || isNaN(monthFromDate) || isNaN(dayFromDate)) {
      throw new HttpException(`Некорректный формат даты: ${dateString}`, 400);
    }
    const date = new Date(yearFromDate, monthFromDate - 1, dayFromDate);

    if (
      date.getFullYear() !== yearFromDate ||
      date.getMonth() + 1 !== monthFromDate ||
      date.getDate() !== dayFromDate
    ) {
      throw new HttpException(`Некорректная дата: ${dateString}`, 400);
    }

    if (yearFromDate !== year || monthFromDate !== month) {
      throw new HttpException(
        `Дата ${dateString} не находится в указанном месяце`,
        404,
      );
    }
  }

  async updateDayState(dayId: string, newState: DayState) {
    try {
      await this._prismaService.calendar.update({
        where: { id: dayId },
        data: { state: newState },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('День календаря не найден', 404);
      }
      console.error('Ошибка при обновлении состояния дня:', error);
      throw new HttpException('Ошибка при обновлении состояния дня', 500);
    }
  }

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

  public async create_all(data: CreateCalendarAllDto) {
    const { customDays, userId, dateForCreate } = data;

    if (!userId || !dateForCreate) {
      throw new HttpException(
        'Отсутствует ID пользователя или дата для создания',
        400,
      );
    }

    const [yearStr, monthStr] = dateForCreate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this._validateDateForCreate(year, month);

    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0));
    const daysMap = new Map<
      string,
      { state: DayState; userId: string; workTime?: string }
    >();

    // Инициализируем все дни месяца как empty
    for (
      let date = new Date(firstDayOfMonth);
      date <= lastDayOfMonth;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().slice(0, 10);
      daysMap.set(dateString, { state: DayState.empty, userId });
    }

    // Применяем кастомные настройки из customDays
    if (customDays) {
      for (const { date: dateString, state, workTime } of customDays) {
        this._validateNoWorkDay(dateString, year, month); // Валидация даты
        if (daysMap.has(dateString)) {
          const dayData = daysMap.get(dateString)!;
          dayData.state = state || dayData.state; // Если state не указан, оставляем текущий
          dayData.workTime = workTime; // workTime может быть undefined
        }
      }
    }

    try {
      const daysToCreate = [...daysMap.entries()].map(
        ([dateString, { state, userId, workTime }]) => ({
          date: new Date(dateString),
          state: state,
          userId: userId,
          workTime: workTime,
        }),
      );
      const settings = await this._settingsService.findByUser(userId);

      await this._prismaService.$transaction(async (prisma) => {
        for (const day of daysToCreate) {
          const day_ = await prisma.calendar.upsert({
            where: {
              date_userId: {
                date: day.date,
                userId: day.userId,
              },
            },
            update: {
              state: day.state,
              time: day.workTime,
            },
            create: {
              date: day.date,
              state: day.state,
              time: day.workTime || settings.defaultWorkTime,
              userId: day.userId,
            },
          });

          if (!day_) continue;

          if (day.state === DayState.notHave) {
            await this._freeSlotService.removeMany(day_.id);
          }
        }
      });

      for (const day of daysToCreate) {
        await this._timeSlotAlgorithm.generateFreeSlots(
          userId,
          day.date.toISOString(),
          day.workTime,
        );
      }

      return this._prismaService.calendar.findMany({
        where: {
          userId: userId,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        include: {
          freeSlots: {
            select: {
              time: true,
            },
          },
        },
      });
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

  public async findByUserDate(userId, date) {
    try {
      return await this._prismaService.calendar.findUnique({
        where: {
          date_userId: {
            date: date,
            userId: userId,
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске дня календаря', 500);
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

  public async findInterval(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Некорректная дата', 400);
      }

      return await this._prismaService.calendar.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске интервала дней', 500);
    }
  }

  public async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    try {
      return await this._prismaService.calendar.update({
        where: { id: id },
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
