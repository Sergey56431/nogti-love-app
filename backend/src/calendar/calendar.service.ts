import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateCalendarDto } from './dto';
import { PrismaService } from '../prisma';
import { Calendar, DayState } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FreeSlotsService } from '../freeSlots';
import { CreateCalendarAllDto } from './dto/create-calendar-all.dto';
import { ICalendarService } from './interfaces';
import { IFreeSlotsService } from '../freeSlots/interfaces';
import { TimeSlotUtilits } from '../utilits';
import { ITimeSlotUtilits } from '../utilits/interfaces';

interface DayData {
  state: DayState;
  userId: string;
  workTime?: string;
}

class TimeInterval {
  constructor(
    public start: number,
    public end: number,
  ) {}
}

@Injectable()
export class GenerateSlotsAlgorithm {
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject(TimeSlotUtilits)
    private readonly _timeSlotUtilits: ITimeSlotUtilits,
  ) {}

  private async _getExistingAppointments(
    userId: string,
    date: Date,
  ): Promise<TimeInterval[]> {
    const existingDirects = await this._prismaService.directs.findMany({
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

    const appointments = await Promise.all(
      existingDirects.map(async (direct) => {
        const servicesDuration = await direct.services.reduce(
          async (accPromise, ds) => {
            const acc = await accPromise;
            const minutes = await this._timeSlotUtilits.convertTimeToMinutes(
              ds.service.time,
            );
            return acc + minutes;
          },
          Promise.resolve(0),
        );
        const startTime = await this._timeSlotUtilits.convertTimeToMinutes(
          direct.time,
        );
        return new TimeInterval(startTime, startTime + servicesDuration);
      }),
    );
    return appointments.sort((a, b) => a.start - b.start);
  }

  // ----------------- Основная логика генерации

  public async generateFreeSlots(
    userId: string,
    date_: string,
    customWorkTime?: string,
    calendarDay?: Calendar,
  ) {
    const date = new Date(date_);

    const settings = await this._timeSlotUtilits.getUserSettings(userId);
    const [startTime, endTime] = await this._timeSlotUtilits.getWorkTime(
      settings,
      customWorkTime,
    );

    if (!calendarDay || calendarDay.state === 'notHave') {
      return [];
    }
    const calendarId = calendarDay.id;
    const { startMinutes, endMinutes, breakMinutes, granularityMinutes } =
      await this._timeSlotUtilits.calculateTimeBoundaries(
        startTime,
        endTime,
        settings,
      );
    const existingAppointments = await this._getExistingAppointments(
      userId,
      date,
    );

    const slotsToCreate = await this._timeSlotUtilits.generateSlots(
      startMinutes,
      endMinutes,
      granularityMinutes,
      breakMinutes,
      existingAppointments,
      calendarId,
    );

    if (slotsToCreate.length > 0) {
      return slotsToCreate;
    }
    return [];
  }
}

@Injectable()
export class CalendarService implements ICalendarService {
  private readonly logger = new Logger(CalendarService.name);
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject(FreeSlotsService)
    private readonly _freeSlotService: IFreeSlotsService,
    private readonly _generateSlotsAlgorithm: GenerateSlotsAlgorithm,
  ) {}

  // Год и месяц для которых создается календарь не в прошлом
  private _validateDateForCreate(year: number, month: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // месяцы начинаются с 0

    // Если год меньше текущего или год равен текущему, но месяц меньше текущего
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      this.logger.warn(
        `Пользователь ввёл некоректрые данные: Нельзя создать календарь на прошлый месяц (${year} ${month})`,
      );
      throw new HttpException(
        'Нельзя создать календарь на прошедший месяц',
        400,
      );
    }
  }

  // корректность даты и что она принадлежит указанному месяцу
  private _validateNoWorkDay(dateString: string, year: number, month: number) {
    const dateParts = dateString.split('-');
    const yearFromDate = parseInt(dateParts[0], 10);
    const monthFromDate = parseInt(dateParts[1], 10);
    const dayFromDate = parseInt(dateParts[2], 10);

    // Проверка что все части даты числа
    if (isNaN(yearFromDate) || isNaN(monthFromDate) || isNaN(dayFromDate)) {
      this.logger.warn(`Пользователь ввел неверный формат даты ${dateString}`);
      throw new HttpException(`Некорректный формат даты: ${dateString}`, 400);
    }

    //месяцы начинаются с 0 (0 - январь 11 - декабрь)
    const date = new Date(yearFromDate, monthFromDate - 1, dayFromDate);

    // Проверка корректности даты
    if (
      date.getFullYear() !== yearFromDate ||
      date.getMonth() + 1 !== monthFromDate ||
      date.getDate() !== dayFromDate
    ) {
      this.logger.warn(`Пользователь ввел некорректную дату ${dateString}`);
      throw new HttpException(`Некорректная дата: ${dateString}`, 400);
    }

    // Дата принадлежит указанному месяцу и году
    if (yearFromDate !== year || monthFromDate !== month) {
      this.logger.log(
        `Пользователь ввёл некоректрые данные: дата ${dateString} не находится в указанном месяце`,
      );
      throw new HttpException(
        `Дата ${dateString} не находится в указанном месяце`,
        404,
      );
    }
  }

  //Получает из БД существующие дни для пользователя и месяца
  private async _existingDays(userId, firstDayOfMonth, lastDayOfMonth) {
    // Для хранения данных о днях, ключ - дата, значение - объект с данными дня
    const daysMap = new Map<
      string,
      { state: DayState; userId: string; workTime?: string }
    >();

    // дни пользователя за указанный месяц
    const existingDays = await this._prismaService.calendar.findMany({
      where: {
        userId: userId,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // Заполняю daysMap данными из базы
    for (const day of existingDays) {
      const dateString = day.date.toISOString().slice(0, 10); // Формат "YYYY-MM-DD"
      daysMap.set(dateString, {
        state: day.state,
        userId: day.userId,
        workTime: day.time,
      });
    }
    return daysMap;
  }

  //Инициализирует Map со всеми днями месяца добавляя empty дни если их нет в БД
  private async _initializeDaysMap(
    userId: string,
    firstDayOfMonth: Date,
    lastDayOfMonth: Date,
  ): Promise<Map<string, DayData>> {
    const daysMap = await this._existingDays(
      userId,
      firstDayOfMonth,
      lastDayOfMonth,
    );

    for (
      let d = new Date(firstDayOfMonth);
      d <= lastDayOfMonth;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().slice(0, 10);
      if (!daysMap.has(dateString)) {
        daysMap.set(dateString, {
          state: DayState.empty,
          userId,
          workTime: '',
        });
      }
    }
    return daysMap;
  }

  // Применяет кастомные настройки customDays к Map дней
  private _applyCustomDays(
    daysMap: Map<string, DayData>,
    customDays: { date: string; state?: DayState; workTime?: string }[],
    year: number,
    month: number,
  ): void {
    if (!customDays) {
      return;
    }

    for (const { date: dateString, state, workTime } of customDays) {
      this._validateNoWorkDay(dateString, year, month);
      daysMap.set(dateString, {
        state: state || DayState.empty,
        userId: daysMap.get(dateString)?.userId || '', // userId должен быть, но на всякий случай
        workTime: state === DayState.notHave ? '' : (workTime ?? ''),
      });
    }
  }

  //Преобразует Map дней в массив объектов для Prisma
  private _getDaysToCreate(
    daysMap: Map<string, DayData>,
  ): { date: Date; state: DayState; userId: string; workTime: string }[] {
    return [...daysMap.entries()].map(([dateString, dayData]) => {
      const { state, userId, workTime } = dayData;
      return {
        date: new Date(dateString),
        state,
        userId,
        workTime,
      };
    });
  }

  public async create(createCalendarDto) {
    try {
      const date = new Date(createCalendarDto.date);
      if (isNaN(date.getTime())) {
        this.logger.warn(
          `Некорректная дата при создании календаря ${createCalendarDto.date}`,
        );
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
      this.logger.error(
        `Ошибка при создании календаря с ID ${createCalendarDto.id}`,
        error.stack,
      );
      throw new HttpException('Ошибка при создании дня календаря', 500);
    }
  }

  public async create_all(data: CreateCalendarAllDto) {
    const { customDays, userId, dateForCreate } = data;

    if (!userId || !dateForCreate) {
      this.logger.warn(
        `Отсутствует ID пользователя ${userId} или дата для создания ${dateForCreate}`,
      );
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

    //получение уже существующих дней календаря для данного пользователя и месяца
    const daysMap = await this._initializeDaysMap(
      userId,
      firstDayOfMonth,
      lastDayOfMonth,
    );

    // добавление кастомных дней
    this._applyCustomDays(daysMap, customDays, year, month);

    try {
      // массив объектов для записи в БД
      const daysToCreate = this._getDaysToCreate(daysMap);

      const settings = await this._prismaService.settings.findFirst({
        where: { userId },
      });

      //Обработка каждого дня в транзакции
      await this._prismaService.$transaction(async (prisma) => {
        for (const day of daysToCreate) {
          //-- Логика из _processDayWithinTransaction --
          const existingDay = await prisma.calendar.findUnique({
            where: { date_userId: { date: day.date, userId: day.userId } },
            include: { directs: true },
          });

          if (
            existingDay &&
            existingDay.directs.length > 0 &&
            day.state === DayState.notHave
          ) {
            this.logger.warn(
              `Нельзя сделать день ${day.date.toISOString().slice(0, 10)} нерабочим, так как на него есть записи.`,
            );
            throw new HttpException(
              `Нельзя сделать день ${day.date.toISOString().slice(0, 10)} нерабочим, так как на него есть записи.`,
              400,
            );
          }
          //Если день был notHave и его нет в customDay, то он должен стать пустым
          if (
            existingDay &&
            existingDay.state === DayState.notHave &&
            !customDays?.find(
              (cDay) => cDay.date === day.date.toISOString().slice(0, 10),
            )
          ) {
            day.state = DayState.empty;
          }

          const day_ = await prisma.calendar.upsert({
            where: { date_userId: { date: day.date, userId: day.userId } },
            update: {
              state: day.state,
              time:
                day.state === DayState.notHave
                  ? ''
                  : day.workTime || settings.defaultWorkTime,
            },
            create: {
              date: day.date,
              state: day.state,
              time:
                day.state === DayState.notHave
                  ? ''
                  : day.workTime || settings.defaultWorkTime,
              userId: day.userId,
            },
          });

          if (!day_) continue;

          if (day.state === DayState.notHave) {
            await this._freeSlotService.removeMany(day_.id);
          }
        }
      });

      // генерация слотов
      for (const day of daysToCreate) {
        const calendarDay = await this.findByUserDate(userId, day.date);
        const slotsToCreate =
          await this._generateSlotsAlgorithm.generateFreeSlots(
            userId,
            day.date.toISOString(),
            day.workTime,
            calendarDay,
          );
        await this._freeSlotService.createFreeSlots(slotsToCreate);
      }

      return await this._prismaService.calendar.findMany({
        where: { userId, date: { gte: firstDayOfMonth, lte: lastDayOfMonth } },
        include: { freeSlots: { select: { time: true } } },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        throw new HttpException('Пользователь не найден', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при создании календаря`, error.stack);
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
      this.logger.error(`Ошибка при поиске всего календаря`, error.stack);
      throw new HttpException('Ошибка при поиске всего календаря', 500);
    }
  }

  public async findByUser(userId: string) {
    try {
      return await this._prismaService.calendar.findMany({
        where: { userId: userId },
        include: {
          directs: {
            where: { userId: userId },
          },
          freeSlots: { select: { time: true } },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(
        `Ошибка при поиске календаря по ID пользователя ${userId}`,
        error.stack,
      );
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
          freeSlots: { select: { time: true } },
        },
      });
      if (!result) {
        this.logger.warn(
          `Пользователь ввел неверные данные для поиска календаря ${id}`,
        );
        throw new HttpException('День не найден', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(`Ошибка при поиске дня календаря`, error.stack);
      throw new HttpException('Ошибка сервера при поиске дня календаря', 500);
    }
  }

  public async findInterval(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        this.logger.log(
          `Пользователь ввел некорректную дату с интервалом от ${startDate} до ${endDate}`,
        );
        throw new HttpException('Некорректная дата', 400);
      }

      return await this._prismaService.calendar.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          directs: true,
          freeSlots: { select: { time: true } },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error('Ошибка при поиске интервала дней', error.stack);
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
          freeSlots: { select: { time: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        this.logger.warn(
          `Ошибка при поиске дня календаря ${updateCalendarDto} для обновления по ID ${id}`,
        );
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
        this.logger.warn(
          `Ошибка при поиске дня календаря для удаления по ID ${id}`,
        );
        throw new HttpException('День календаря не найден', 404);
      }
      console.log(error);
      this.logger.error(
        `Ошибка при удалении дня календаря по ID ${id}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при удалении дня календаря', 500);
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
      this.logger.error(
        `Пользователь ${userId} ввел неверные данные для поиска дня календаря ${date}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при поиске дня календаря', 500);
    }
  }
}
