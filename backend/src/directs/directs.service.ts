import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DayState, DirectsState, Prisma } from '@prisma/client';
import { CreateDirectDto, UpdateDirectDto } from './dto';
import { IDirectsService } from './interfaces';
import { FreeSlotsService } from '../freeSlots';
import { IFreeSlotsService } from '../freeSlots/interfaces';
import { TimeSlotUtilits } from '../utilits';
import { ITimeSlotUtilits } from '../utilits/interfaces';

@Injectable()
export class BookSlotsAlgorithm {
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject(FreeSlotsService)
    private readonly _freeSlotsService: IFreeSlotsService,
    @Inject(TimeSlotUtilits)
    private readonly _timeSlotUtilits: ITimeSlotUtilits,
  ) {}

  private async recalculateCalendarState(
    calendarId: string,
    userId: string,
  ): Promise<void> {
    const calendarDay = await this._prismaService.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendarDay || calendarDay.state === DayState.notHave) {
      return;
    }

    const userSettings = await this._timeSlotUtilits.getUserSettings(userId);
    const minServiceDuration =
      await this._timeSlotUtilits.getMinimumServiceDuration(userId);
    const hasFreeSlots = await this._timeSlotUtilits.hasFreeSlots(calendarId);

    if (hasFreeSlots) {
      let maxAvailableTime = 0;
      let currentAvailableTime = 0;
      const granularityMinutes =
        await this._timeSlotUtilits.convertTimeToMinutes(
          userSettings.timeGranularity,
        );

      const [startTime, endTime] = userSettings.defaultWorkTime.split('-');
      let startMinutes =
        await this._timeSlotUtilits.convertTimeToMinutes(startTime);
      const endMinutes =
        await this._timeSlotUtilits.convertTimeToMinutes(endTime);

      while (startMinutes < endMinutes) {
        const timeString =
          await this._timeSlotUtilits.formatMinutesToTime(startMinutes);
        const currentSlot = await this._freeSlotsService.findUniqueSlot(
          calendarId,
          timeString,
        );

        if (currentSlot && !currentSlot.isBooked) {
          currentAvailableTime += granularityMinutes;
        } else {
          maxAvailableTime = Math.max(maxAvailableTime, currentAvailableTime);
          currentAvailableTime = 0;
        }
        startMinutes += granularityMinutes;
      }
      maxAvailableTime = Math.max(maxAvailableTime, currentAvailableTime);

      if (minServiceDuration === 0 || minServiceDuration === Infinity) {
        await this._updateCalendarDayState(calendarId, DayState.full);
      } else if (maxAvailableTime < minServiceDuration) {
        await this._updateCalendarDayState(calendarId, DayState.full);
      } else {
        await this._updateCalendarDayState(calendarId, DayState.have);
      }
    } else {
      await this._updateCalendarDayState(calendarId, DayState.full);
    }
  }

  public async bookNewSlotsForUpdate(
    directId: string,
    updateDto: UpdateDirectDto,
  ): Promise<void> {
    const { userId, date: dateStr, time, services } = updateDto;

    const calendar = await this._prismaService.calendar.findUnique({
      where: { date_userId: { date: new Date(dateStr), userId } },
    });

    if (!calendar) {
      throw new HttpException('Календарь для обновления не найден', 404);
    }

    const userSettings = await this._timeSlotUtilits.getUserSettings(userId);
    const granularityMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.timeGranularity,
    );
    const breakMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.defaultBreakTime,
    );

    const serviceIds = services.map((s) => s.serviceId);
    const totalServiceDuration =
      await this._timeSlotUtilits.getServicesDuration(serviceIds);
    const newAppointmentStart =
      await this._timeSlotUtilits.convertTimeToMinutes(time);

    const newAppointmentEnd =
      newAppointmentStart + totalServiceDuration + breakMinutes;

    // Проверка на пересечение с ДРУГИМИ записями
    const existingDirects = await this._prismaService.directs.findMany({
      where: {
        calendarId: calendar.id,
        id: { not: directId }, // Исключаю текущую обновляемую запись
        state: { not: 'cancelled' },
      },
      include: { services: { include: { service: true } } },
    });

    for (const direct of existingDirects) {
      const directStart = await this._timeSlotUtilits.convertTimeToMinutes(
        direct.time,
      );
      const directServiceDuration = await direct.services.reduce(
        async (acc, ds) =>
          (await acc) +
          (await this._timeSlotUtilits.convertTimeToMinutes(ds.service.time)),
        Promise.resolve(0),
      );
      const directEnd = directStart + directServiceDuration + breakMinutes;

      if (newAppointmentStart < directEnd && newAppointmentEnd > directStart) {
        throw new HttpException(
          'Новое время записи пересекается с другой существующей записью.',
          409,
        );
      }
    }

    // Бронирование новых слотов
    let currentTime = newAppointmentStart;
    while (currentTime < newAppointmentEnd) {
      const currentTimeString =
        await this._timeSlotUtilits.formatMinutesToTime(currentTime);
      const currentSlot = await this._freeSlotsService.findUniqueSlot(
        calendar.id,
        currentTimeString,
      );

      if (currentSlot) {
        if (currentSlot.isBooked) {
          // Эта проверка важна на случай, если слот был занят чем-то еще
          throw new HttpException(
            `Конфликт при обновлении: слот на ${currentTimeString} уже занят.`,
            409,
          );
        }
        await this._prismaService.freeSlot.update({
          where: { id: currentSlot.id },
          data: { isBooked: true },
        });
      }
      currentTime += granularityMinutes;
    }

    await this.recalculateCalendarState(calendar.id, userId);
  }

  public async bookSlot(
    userId: string,
    dateStr: string,
    time: string,
    serviceIds: string[],
    clientName: string,
    phone: string,
    comment: string | undefined,
    calendarId: string,
  ) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new HttpException('Некорректная дата', 400);
    }

    const userSettings = await this._timeSlotUtilits.getUserSettings(userId);
    const breakMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.defaultBreakTime,
    );

    const granularityMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.timeGranularity,
    );

    const calendarDay = await this._prismaService.calendar.findUnique({
      where: {
        date_userId: {
          date: date,
          userId: userId,
        },
      },
    });
    if (!calendarDay) {
      throw new HttpException('День не найден в календаре', 404);
    }
    if (calendarDay.state === DayState.notHave) {
      throw new HttpException('Этот день недоступен для записи', 400);
    }

    const startFreeSlot = await this._freeSlotsService.findUniqueSlot(
      calendarDay.id,
      time,
    );
    if (!startFreeSlot) {
      throw new HttpException('Слот не найден', 404);
    }
    if (startFreeSlot.isBooked) {
      throw new HttpException('Слот уже занят', 409);
    }

    const totalServiceDuration =
      await this._timeSlotUtilits.getServicesDuration(serviceIds);

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

    const filteredDirects = existingDirects.filter(
      (direct) => direct.state !== DirectsState.cancelled,
    );

    const appointments = await Promise.all(
      filteredDirects.map(async (direct) => {
        const servicesDuration = await direct.services.reduce(
          async (accPromise, ds) => {
            const acc = await accPromise;
            const serviceMinutes =
              await this._timeSlotUtilits.convertTimeToMinutes(ds.service.time);
            return acc + serviceMinutes;
          },
          Promise.resolve(0),
        );
        const startTime = await this._timeSlotUtilits.convertTimeToMinutes(
          direct.time,
        );
        return {
          start: startTime,
          end: startTime + servicesDuration,
          id: direct.id,
        };
      }),
    );

    appointments.sort((a, b) => a.start - b.start);

    const newAppointmentStart =
      await this._timeSlotUtilits.convertTimeToMinutes(time);
    const breakTime = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.defaultBreakTime,
    );
    const newAppointmentEnd =
      newAppointmentStart + totalServiceDuration + breakTime;

    //проверяе на пересечения со всеми существующими записями
    for (const appointment of appointments) {
      if (
        newAppointmentStart < appointment.end &&
        newAppointmentEnd > appointment.start
      ) {
        throw new HttpException(
          'Время записи пересекается с существующей записью',
          400,
        );
      }
    }

    //ищу ближайшую предыдущую запись
    let previousAppointment: { start: number; end: number; id: string } | null =
      null;
    for (let i = appointments.length - 1; i >= 0; i--) {
      if (appointments[i].end <= newAppointmentStart) {
        previousAppointment = appointments[i];
        break;
      }
    }

    //проверяю перерыв, только если есть предыдущая запись
    if (previousAppointment) {
      const timeBetween = newAppointmentStart - previousAppointment.end;
      if (timeBetween < breakMinutes) {
        throw new HttpException('Недостаточный перерыв между записями', 400);
      }
    }

    const createDirectDto: CreateDirectDto = {
      userId: userId.toString(),
      date: dateStr.toString(),
      time: time.toString(),
      clientName: clientName.toString(),
      phone: phone.toString(),
      comment: comment.toString(),
      services: serviceIds.map((serviceId) => ({ serviceId })),
      state: DirectsState.notConfirmed,
    };

    const direct = await this._prismaService.directs.create({
      data: {
        userId: createDirectDto.userId.toString(),
        time: createDirectDto.time.toString(),
        clientName: createDirectDto.clientName.toString(),
        phone: createDirectDto.phone.toString(),
        comment: createDirectDto.comment.toString(),
        calendarId: calendarId,
        state: createDirectDto.state,
      },
    });

    let currentTime = newAppointmentStart;
    while (currentTime < newAppointmentEnd) {
      const currentTimeString =
        await this._timeSlotUtilits.formatMinutesToTime(currentTime);
      const currentSlot = await this._freeSlotsService.findUniqueSlot(
        calendarDay.id,
        currentTimeString,
      );

      if (currentSlot) {
        await this._prismaService.freeSlot.update({
          where: { id: currentSlot.id },
          data: { isBooked: true },
        });
      }

      currentTime += granularityMinutes;
    }

    const minServiceDuration =
      await this._timeSlotUtilits.getMinimumServiceDuration(userId);
    const hasFreeSlots = await this._timeSlotUtilits.hasFreeSlots(
      calendarDay.id,
    );

    if (hasFreeSlots) {
      let maxAvailableTime = 0;
      let currentAvailableTime = 0;

      const [startTime, endTime] = userSettings.defaultWorkTime.split('-');
      let startMinutes =
        await this._timeSlotUtilits.convertTimeToMinutes(startTime);
      const endMinutes =
        await this._timeSlotUtilits.convertTimeToMinutes(endTime);

      while (startMinutes < endMinutes) {
        const timeString =
          await this._timeSlotUtilits.formatMinutesToTime(startMinutes);
        const currentSlot = await this._freeSlotsService.findUniqueSlot(
          calendarDay.id,
          timeString,
        );

        if (currentSlot && !currentSlot.isBooked) {
          currentAvailableTime += granularityMinutes;
        } else {
          maxAvailableTime = Math.max(maxAvailableTime, currentAvailableTime);
          currentAvailableTime = 0;
        }
        startMinutes += granularityMinutes;
      }
      maxAvailableTime = Math.max(maxAvailableTime, currentAvailableTime);

      if (minServiceDuration === 0 || minServiceDuration === Infinity) {
        // Проверка на случай отсутствия услуг
        await this._updateCalendarDayState(calendarDay.id, DayState.full);
      } else if (maxAvailableTime < minServiceDuration) {
        await this._updateCalendarDayState(calendarDay.id, DayState.full);
      } else {
        await this._updateCalendarDayState(calendarDay.id, DayState.have);
      }
    } else {
      await this._updateCalendarDayState(calendarDay.id, DayState.full);
    }

    return { ...createDirectDto, directId: direct.id };
  }

  public async freeSlotsAndRecalculateCalendar(
    directId: string,
  ): Promise<void> {
    const direct = await this._prismaService.directs.findUnique({
      where: { id: directId },
      include: {
        services: {
          select: {
            service: {
              select: {
                id: true,
                time: true,
              },
            },
          },
        },
      },
    });

    if (!direct) {
      // НЕ НУЖНО бросать ошибку чтобы не прерывать процесс удаления!!!!!!!!!!!
      console.warn(
        `[freeSlotsAndRecalculateCalendar] Запись с ID ${directId} не найдена для освобождения слотов.`,
      );
      return;
    }

    const { userId, calendarId, time: directTimeStr } = direct;
    if (!calendarId) {
      console.warn(
        `[freeSlotsAndRecalculateCalendar] У записи ${directId} отсутствует calendarId.`,
      );
      return;
    }

    const userSettings = await this._timeSlotUtilits.getUserSettings(userId);
    const granularityMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.timeGranularity,
    );
    const breakMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.defaultBreakTime,
    );

    let totalServiceDurationMinutes = 0;
    if (direct.services && direct.services.length > 0) {
      for (const ds of direct.services) {
        if (ds.service && ds.service.time) {
          totalServiceDurationMinutes +=
            await this._timeSlotUtilits.convertTimeToMinutes(ds.service.time);
        }
      }
    }

    const directStartMinutes =
      await this._timeSlotUtilits.convertTimeToMinutes(directTimeStr);
    // освобождаю слоты зарезервированные под перерыв
    const directEndMinutes =
      directStartMinutes + totalServiceDurationMinutes + breakMinutes;

    let currentMinuteMarker = directStartMinutes;
    while (currentMinuteMarker < directEndMinutes) {
      const slotTimeStr =
        await this._timeSlotUtilits.formatMinutesToTime(currentMinuteMarker);
      const slotToFree = await this._freeSlotsService.findUniqueSlot(
        calendarId,
        slotTimeStr,
      );

      if (slotToFree && slotToFree.isBooked) {
        await this._freeSlotsService.updateSlotBooking(slotToFree.id, false);
      }
      currentMinuteMarker += granularityMinutes;
    }
    await this.recalculateCalendarState(calendarId, userId);
  }

  private async _updateCalendarDayState(calendarId: string, state: DayState) {
    const calendarDay = await this._prismaService.calendar.findUnique({
      where: { id: calendarId },
    });
    if (!calendarDay || calendarDay.state === DayState.notHave) {
      return;
    }
    if (calendarDay.state !== state) {
      return await this._prismaService.calendar.update({
        where: { id: calendarId },
        data: { state: state },
      });
    }
  }

  public async getAvailableSlotsForEditing(directId: string): Promise<any[]> {
    const direct = await this._prismaService.directs.findUnique({
      where: { id: directId },
      include: {
        services: { select: { service: { select: { time: true } } } },
      },
    });

    if (!direct || !direct.calendarId) {
      throw new HttpException(
        'Запись для редактирования не найдена или не привязана к календарю',
        404,
      );
    }

    const { calendarId, userId, time: directTimeStr } = direct;

    const allSlotsForDay = await this._prismaService.freeSlot.findMany({
      where: { calendarId },
      orderBy: { time: 'asc' },
    });

    //отбираю все изначально свободные слоты
    const freeSlots = allSlotsForDay.filter((slot) => !slot.isBooked);

    //вычисляю какие слоты занимает ТЕКУЩАЯ запись и добавляю их к свободным
    const userSettings = await this._timeSlotUtilits.getUserSettings(userId);
    const granularityMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.timeGranularity,
    );

    let totalServiceDurationMinutes = 0;
    for (const ds of direct.services) {
      totalServiceDurationMinutes +=
        await this._timeSlotUtilits.convertTimeToMinutes(ds.service.time);
    }

    const directStartMinutes =
      await this._timeSlotUtilits.convertTimeToMinutes(directTimeStr);
    const directEndMinutes = directStartMinutes + totalServiceDurationMinutes;

    const occupiedByThisDirectSlots = [];
    let currentMinuteMarker = directStartMinutes;

    while (currentMinuteMarker < directEndMinutes) {
      const slotTimeStr =
        await this._timeSlotUtilits.formatMinutesToTime(currentMinuteMarker);

      const occupiedSlot = allSlotsForDay.find(
        (slot) => slot.time === slotTimeStr,
      );
      if (occupiedSlot) {
        occupiedByThisDirectSlots.push(occupiedSlot);
      }
      currentMinuteMarker += granularityMinutes;
    }

    const availableSlots = [...freeSlots, ...occupiedByThisDirectSlots];

    const uniqueSlots = Array.from(
      new Map(availableSlots.map((slot) => [slot.id, slot])).values(),
    );
    uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));

    const formattedSlots = uniqueSlots.map((slot) => ({ time: slot.time }));

    return formattedSlots;
  }
}

@Injectable()
export class DirectsService implements IDirectsService {
  private readonly logger = new Logger(DirectsService.name);
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _bookSlotsAlgorithm: BookSlotsAlgorithm,
  ) {}

  public async findByDate(date: string) {
    try {
      const date_ = new Date(date);
      if (isNaN(date_.getTime())) {
        this.logger.log(`Пользователь ввел некорректную дату ${date}`);
        throw new HttpException('Некорректная дата', 400);
      }

      const directs = await this._prismaService.directs.findMany({
        where: {
          calendar: {
            date: date_,
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

      if (directs.length === 0) {
        return [];
      }

      const phoneNumbers = [
        ...new Set(directs.map((d) => d.phone).filter(Boolean)),
      ] as string[];

      const clients = await this._prismaService.client.findMany({
        where: {
          phoneNumber: {
            in: phoneNumbers,
          },
        },
        select: {
          id: true,
          phoneNumber: true,
        },
      });

      const clientMap = new Map(clients.map((c) => [c.phoneNumber, c.id]));

      const result = directs.map((direct) => {
        const clientId = direct.phone
          ? clientMap.get(direct.phone) || null
          : null;
        return {
          ...direct,
          clientId,
        };
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      this.logger.error(`Ошибка при поиске по дате ${date}`, error.stack);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async create(createDirectDto: CreateDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        this.logger.log(
          `Пользователь ввел некорректную дату ${date} для создания записи, ${createDirectDto}`,
        );
        throw new HttpException('Некорректная дата', 400);
      }

      const calendar = await this._prismaService.calendar.findUnique({
        where: {
          date_userId: {
            date: date,
            userId: createDirectDto.userId,
          },
        },
      });

      const errors = [];

      if (!calendar) {
        this.logger.warn(
          `Календарь для указанной даты ${date} не найден для создания записи, ${createDirectDto}`,
        );
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
        this.logger.warn(
          `Введите данные ${createDirectDto} или ID пользователя для создания записи`,
        );
        errors.push(
          new HttpException(
            'Введите данные или id пользователя',
            400,
          ).getResponse(),
        );
      }
      if (!createDirectDto.services || !createDirectDto.services[0]) {
        this.logger.warn(
          `Выберите услуги ${createDirectDto} для создания записи`,
        );
        errors.push(new HttpException('Выберите услуги', 400).getResponse());
      }

      if (errors.length > 0) {
        throw new HttpException({ errors: errors }, 400);
      }

      const newDirect = await this._bookSlotsAlgorithm.bookSlot(
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
          this.logger.warn(
            `Услуга с ID ${service.serviceId} не найдена при создании записи`,
          );
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
        this.logger.warn(
          `Ошибка при поиске записи: запись не найдена при создании, ${createDirectDto}`,
        );
        throw new HttpException('Запись не найдена', 404);
      }
      console.error(error);
      this.logger.error(
        `Ошибка при создании записи, ${createDirectDto}`,
        error,
      );
      throw new HttpException('Ошибка сервера при создании записи', 500);
    }
  }

  public async findAll() {
    try {
      return await this._prismaService.directs.findMany();
    } catch (error) {
      console.error(error);
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
      console.error(error);
      this.logger.error(
        `Ошибка при поиске записи по ID пользователя ${id}`,
        error.stack,
      );
      throw new HttpException('Ошибка при получении записи', 500);
    }
  }

  public async findByUserDate(userId: string, date: string): Promise<object[]> {
    try {
      const date_ = new Date(date);
      if (isNaN(date_.getTime())) {
        this.logger.warn(`Пользователь ввел некорректную дату ${date}`);
        throw new HttpException('Некорректная дата', 400);
      }

      const calendarDay = await this._prismaService.calendar.findUnique({
        where: {
          date_userId: {
            date: date_,
            userId: userId,
          },
        },
      });

      if (!calendarDay) {
        this.logger.warn(
          `Неверный ID  ${userId} пользователя или отсутствие у него календаря на данную дату ${date}`,
        );
        throw new HttpException(
          'Неверный ID пользователя или отсутствие у него календаря на данную дату',
          400,
        );
      }

      const directs = await this._prismaService.directs.findMany({
        where: {
          userId: userId,
          calendarId: calendarDay.id,
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

      this.logger.log(
        `Успешно найдено ${directs.length} записей для пользователя ${userId} на ${date}`,
      );

      if (directs.length === 0) return [];

      const phoneNumbers = [
        ...new Set(directs.map((d) => d.phone).filter(Boolean)),
      ] as string[];
      if (phoneNumbers.length === 0)
        return directs.map((d) => ({ ...d, clientId: null }));

      const clients = await this._prismaService.client.findMany({
        where: { phoneNumber: { in: phoneNumbers } },
        select: { id: true, phoneNumber: true },
      });

      const clientMap = new Map(clients.map((c) => [c.phoneNumber, c.id]));

      return directs.map((direct) => ({
        ...direct,
        clientId: direct.phone ? clientMap.get(direct.phone) || null : null,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      this.logger.error(
        `Ошибка при поиске по дню ${date} и пользователю ${userId}`,
      );
      throw new HttpException(
        'Ошибка сервера при поиске по дню и пользователю',
        500,
      );
    }
  }

  public async findOne(id: string) {
    try {
      const direct = await this._prismaService.directs.findUnique({
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

      if (!direct) {
        this.logger.warn(`Запись не найдена ${id}`);
        throw new HttpException('Запись не найдена', 404);
      }

      const availableSlots =
        await this._bookSlotsAlgorithm.getAvailableSlotsForEditing(id);

      const client = await this._prismaService.client.findUnique({
        where: { phoneNumber: direct.phone },
        select: {
          id: true,
          name: true,
          lastName: true,
          phoneNumber: true,
          rate: true,
          birthday: true,
          description: true,
          score: true,
        },
      });

      const result = {
        id: direct.id,
        phone: direct.phone,
        clientName: direct.clientName,
        time: direct.time,
        comment: direct.comment,
        userId: direct.userId,
        state: direct.state,
        calendarId: direct.calendarId,
        services: direct.services.map((s) => ({ service: s.service })),
        client: client,
        availableSlots: availableSlots,
      };

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      this.logger.error(`Ошибка при поиске записи ${id}`, error.stack);
      throw new HttpException('Ошибка при получении записи', 500);
    }
  }

  public async update(id: string, updateDirectDto: UpdateDirectDto) {
    try {
      const originalDirect = await this._prismaService.directs.findUnique({
        where: { id },
      });
      if (!originalDirect) {
        throw new HttpException(`Запись с ID ${id} не найдена`, 404);
      }

      // освобождаю старые слоты которые занимает запись
      await this._bookSlotsAlgorithm.freeSlotsAndRecalculateCalendar(id);

      const date = new Date(updateDirectDto.date);
      if (isNaN(date.getTime())) {
        throw new HttpException('Некорректная дата', 400);
      }
      const calendar = await this._prismaService.calendar.findUnique({
        where: {
          date_userId: { date: date, userId: updateDirectDto.userId },
        },
        select: { id: true },
      });
      if (!calendar) {
        throw new HttpException('Календарь для указанной даты не найден', 404);
      }

      // Это решает проблему с типами Prisma
      const updatePayload: Prisma.DirectsUncheckedUpdateInput = {
        clientName: updateDirectDto.clientName,
        phone: updateDirectDto.phone,
        time: updateDirectDto.time,
        comment: updateDirectDto.comment,
        state: updateDirectDto.state,
        userId: updateDirectDto.userId,
        calendarId: calendar.id,
      };

      const updatedDirect = await this._prismaService.directs.update({
        where: { id: id },
        data: updatePayload,
      });

      if (updateDirectDto.services) {
        await this._prismaService.directsServices.deleteMany({
          where: { directId: id },
        });
        const serviceData = updateDirectDto.services.map((service) => ({
          serviceId: service.serviceId,
          directId: id,
        }));
        await this._prismaService.directsServices.createMany({
          data: serviceData,
        });
      }

      //Бронирую новые слоты для уже обновленной записи
      await this._bookSlotsAlgorithm.bookNewSlotsForUpdate(id, updateDirectDto);

      return await this.findOne(updatedDirect.id);
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
        this.logger.warn(
          `Запись при обновлении не найдена, ${id}, ${updateDirectDto}`,
        );
        throw new HttpException(`Запись не найдена`, 404);
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this.logger.warn(
          `Пользователь ${updateDirectDto.userId} или услуга не найдены при обновлении записи ${id}`,
        );
        throw new HttpException(`Пользователь или услуга не найдены`, 404);
      }
      console.error(error);
      this.logger.error(
        `Ошибка при обновлении записи ${id}, ${updateDirectDto}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при обновлении записи', 500);
    }
  }

  public async remove(id: string) {
    try {
      await this._bookSlotsAlgorithm.freeSlotsAndRecalculateCalendar(id);

      this.logger.log(`Слоты для записи ${id} освобождены.`);

      await this._prismaService.directsServices.deleteMany({
        where: { directId: id },
      });

      const deletedDirect = await this._prismaService.directs.delete({
        where: { id },
      });

      this.logger.log(`Запись ${id} успешно удалена из БД.`);
      return deletedDirect;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Запись для удаления не найдена ${id} (P2025 в DirectsService.remove)`,
        );
        throw new HttpException(`Запись не найдена`, 404);
      }
      this.logger.error(
        `Ошибка при удалении записи ${id} в DirectsService: ${error.message}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при удалении данных', 500);
    }
  }
}
