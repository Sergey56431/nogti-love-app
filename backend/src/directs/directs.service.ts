import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DayState, DirectsState } from '@prisma/client';
import { CreateDirectDto } from './dto';
import { IDirectsService } from './interfaces';
import { FreeSlotsService } from '../freeSlots';
import { IFreeSlotsService } from '../freeSlots/interfaces';
import { TimeSlotUtilits } from '../utilits';
import { ITimeSlotUtilits } from '../utilits/interfaces';
import { CreateSettingsDto } from '../settings/dto';

@Injectable()
export class BookSlotsAlgorithm {
  constructor(
    private readonly _prismaService: PrismaService,
    @Inject(FreeSlotsService)
    private readonly _freeSlotsService: IFreeSlotsService,
    @Inject(TimeSlotUtilits)
    private readonly _timeSlotUtilits: ITimeSlotUtilits,
  ) {}

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

    const userSettings: CreateSettingsDto =
      await this._timeSlotUtilits.getUserSettings(userId);
    const breakMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.settingsData[2].value,
    );

    const granularityMinutes = await this._timeSlotUtilits.convertTimeToMinutes(
      userSettings.settingsData[1].value,
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
    const newAppointmentEnd = newAppointmentStart + totalServiceDuration;

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

      const [startTime, endTime] =
        userSettings.settingsData[0].value.split('-');
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

      if (maxAvailableTime < minServiceDuration + breakMinutes) {
        await this._updateState(calendarDay.id, DayState.full);
      } else {
        await this._updateState(calendarDay.id, DayState.have);
      }
    } else {
      await this._updateState(calendarDay.id, DayState.full);
    }

    return { ...createDirectDto, directId: direct.id };
  }

  private async _updateState(calendarId: string, state: DayState) {
    return await this._prismaService.calendar.update({
      where: { id: calendarId },
      data: { state: state },
    });
  }
}

@Injectable()
export class DirectsService implements IDirectsService {
  private readonly _logger = new Logger(DirectsService.name);
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _bookSlotsAlgorithm: BookSlotsAlgorithm,
  ) {}

  public async findByDate(date: string) {
    try {
      const date_ = new Date(date);
      if (isNaN(date_.getTime())) {
        this._logger.warn(`Пользователь ввел некорректную дату ${date}`);
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
      this._logger.error(`Ошибка при поиске по дате ${date}`, error.stack);
      throw new HttpException('Ошибка при получении записей', 500);
    }
  }

  public async create(createDirectDto: CreateDirectDto) {
    try {
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        this._logger.warn(
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
        this._logger.warn(
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
        this._logger.warn(
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
        this._logger.warn(
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
          this._logger.warn(
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
        this._logger.warn(
          `Ошибка при поиске записи: запись не найдена при создании, ${createDirectDto}`,
        );
        throw new HttpException('Запись не найдена', 404);
      }
      console.log(error);
      this._logger.error(
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
      console.log(error);
      this._logger.error('Ошибка при получении всех записей', error.stack);
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
      this._logger.error(
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
        this._logger.warn(`Пользователь ввел некорректную дату ${date}`);
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
        this._logger.warn(
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

      this._logger.log(
        `Успешно найдено ${directs.length} записей для пользователя ${userId} на ${date}`,
      );

      return directs;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this._logger.error(
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
        this._logger.warn(`Запись не найдена ${id}`);
        throw new HttpException('Запись не найдена', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this._logger.error(`Ошибка при поиске записи ${id}`, error.stack);
      throw new HttpException('Ошибка при получении записи', 500);
    }
  }

  public async update(id: string, updateDirectDto) {
    try {
      const date = new Date(updateDirectDto.date);
      if (isNaN(date.getTime())) {
        this._logger.warn(
          `Пользователь ввел некорректную дату ${updateDirectDto.date} при обновлении записи ${id}, ${updateDirectDto}`,
        );
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
        this._logger.warn(
          `Пользователь ввел неверную дату ${updateDirectDto.date} при обновлении записи ${id}, ${updateDirectDto}`,
        );
        throw new HttpException('Календарь для указанной даты не найден', 404);
      }

      if (
        updateDirectDto.state &&
        !Object.values(DirectsState).includes(updateDirectDto.state)
      ) {
        this._logger.warn(
          `Неверный статус ${updateDirectDto.state} при обновлении записи ${id}, ${updateDirectDto}`,
        );
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
              this._logger.warn(
                `Услуга не найдена ${updateDirectDto.serviceId} при обновлении записи ${id}, ${updateDirectDto}`,
              );
              throw new HttpException(`Услуга не найдена`, 404);
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
        this._logger.warn(
          `Запись при обновлении не найдена, ${id}, ${updateDirectDto}`,
        );
        throw new HttpException(`Запись не найдена`, 404);
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2003'
      ) {
        this._logger.warn(
          `Пользователь ${updateDirectDto.userId} не найден при обновлении записи ${id}, ${updateDirectDto}`,
        );
        throw new HttpException(`Пользователь не найден`, 404);
      }
      console.log(error);
      this._logger.error(
        `Ошибка при обновлении записи ${id}, ${updateDirectDto}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при обновлении записи', 500);
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
        this._logger.warn(`Запись для удаления не найдена ${id}`);
        throw new HttpException(`Запись не найдена`, 404);
      }
      console.log(error);
      this._logger.error(`Ошибка при удалении записи ${id}`, error);
      throw new HttpException('Ошибка сервера при удалении данных', 500);
    }
  }
}
