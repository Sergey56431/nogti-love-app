import { ServicesService } from '../services';
import { SettingsService } from '../settings';
import { CreateDirectDto } from '../directs';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { FreeSlotService } from '../freeSlots';
import { Calendar, DayState, DirectsState } from '@prisma/client';
import { CategoryService } from '../categories';
import { ITimeSlotAlgorithm } from './interfaces';
import { IDirectsServiceAlgorithm } from '../directs/interfaces';
import { ICalendarServiceAlgorithm } from '../calendar/interfaces';

class TimeInterval {
  constructor(
    public start: number,
    public end: number,
  ) {}
}

interface TimeBoundaries {
  startMinutes: number;
  endMinutes: number;
  breakMinutes: number;
  granularityMinutes: number;
}

interface UserSettings {
  userId: string;
  defaultWorkTime: string; // "09:00-17:00"
  defaultBreakTime: string; // "00:10"
  timeGranularity: string; // "00:30"
}

@Injectable()
export class TimeSlotAlgorithm implements ITimeSlotAlgorithm {
  constructor(
    private readonly _servicesService: ServicesService,
    private readonly _settingsService: SettingsService,
    @Inject('IDirectsServiceAlgorithm')
    private readonly _directsService: IDirectsServiceAlgorithm,
    @Inject('ICalendarServiceAlgorithm')
    private readonly _calendarService: ICalendarServiceAlgorithm,
    private readonly _freeSlotService: FreeSlotService,
    private readonly _categoryService: CategoryService,
  ) {}

  // ------------------ Вспомогательные методы
  private async _convertTimeToMinutes(time: string): Promise<number> {
    const time1: string[] = time.split(':');
    return +time1[0] * 60 + +time1[1];
  }

  private async _formatMinutesToTime(minutes: number): Promise<string> {
    return `${Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`; //возвращает строку типа "02:23"; `округляем/только в меньшую(minutes / 60):остаток при делении minutes на 60`
  }

  // ------------------ Методы получения данных

  private async _getServicesDuration(serviceIds: string[]): Promise<number> {
    let alltime: number = 0;
    for (const id of serviceIds) {
      const service = await this._servicesService.findOne(id);
      alltime += await this._convertTimeToMinutes(service.time);
    }
    return alltime;
  }

  private async _getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this._settingsService.findByUser(userId);
    if (!settings) {
      throw new Error(`Настройки не найдены для пользователя: ${userId}`);
    }
    return settings;
  }

  private async _getMinimumServiceDuration(userId: string): Promise<number> {
    const categories = await this._categoryService.findByUser(userId);
    if (categories.length === 0) {
      return 0;
    }

    let minDuration = Infinity;

    for (const category of categories) {
      const services = await this._servicesService.findByCategory(category.id);
      if (!services) {
        return 0;
      }
      for (const service of services) {
        const duration = await this._convertTimeToMinutes(service.time);
        if (duration < minDuration) {
          minDuration = duration;
        }
      }
    }
    return minDuration;
  }

  private async _hasFreeSlots(calendarId: string): Promise<boolean> {
    const freeSlots = await this._freeSlotService.findAllFreeSlots(calendarId);
    return !!freeSlots;
  }

  private async _getWorkTime(
    settings: UserSettings,
    customWorkTime?: string,
  ): Promise<[string, string]> {
    const workTime = customWorkTime || settings.defaultWorkTime;
    return workTime.split('-') as [string, string];
  }

  private async _getExistingAppointments(
    userId: string,
    date: Date,
  ): Promise<TimeInterval[]> {
    const existingDirects = await this._directsService.findByDateUser(
      userId,
      date,
    );

    const appointments = await Promise.all(
      existingDirects.map(async (direct) => {
        const servicesDuration = await direct.services.reduce(
          async (accPromise, ds) => {
            const acc = await accPromise;
            const minutes = await this._convertTimeToMinutes(ds.service.time);
            return acc + minutes;
          },
          Promise.resolve(0),
        );
        const startTime = await this._convertTimeToMinutes(direct.time);
        return new TimeInterval(startTime, startTime + servicesDuration);
      }),
    );
    return appointments.sort((a, b) => a.start - b.start);
  }

  // ----------------- Основная логика генерации

  private async _calculateTimeBoundaries(
    startTime: string,
    endTime: string,
    settings: UserSettings,
  ): Promise<TimeBoundaries> {
    const startMinutes = await this._convertTimeToMinutes(startTime);
    const endMinutes = await this._convertTimeToMinutes(endTime);
    const breakMinutes = await this._convertTimeToMinutes(
      settings.defaultBreakTime,
    );
    const granularityMinutes = await this._convertTimeToMinutes(
      settings.timeGranularity,
    );
    return { startMinutes, endMinutes, breakMinutes, granularityMinutes };
  }

  private async _generateSlots(
    startMinutes: number,
    endMinutes: number,
    granularityMinutes: number,
    breakMinutes: number,
    existingAppointments: TimeInterval[],
    calendarId: string,
  ): Promise<{ calendarId: string; time: string }[]> {
    let currentTime = startMinutes;
    let lastEndTime = 0;
    const slots = [];

    while (currentTime < endMinutes) {
      const slotEndTime = currentTime + granularityMinutes;
      let isOverlapping = false;

      for (const appointment of existingAppointments) {
        const prevEndTimeWithBreak =
          lastEndTime + (lastEndTime > 0 ? breakMinutes : 0);
        if (currentTime < appointment.end && slotEndTime > appointment.start) {
          isOverlapping = true;
          break;
        }
        if (currentTime < prevEndTimeWithBreak) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        const timeString = await this._formatMinutesToTime(currentTime);
        slots.push({ calendarId, time: timeString }); // Добавил calendarId
        lastEndTime = currentTime + granularityMinutes;
      }
      currentTime = slotEndTime;
    }

    // Проверка крайнего случая (добавляем слот в конце дня если нужно)
    if (
      existingAppointments.length === 0 ||
      existingAppointments[existingAppointments.length - 1].end <= endMinutes
    ) {
      const timeString = await this._formatMinutesToTime(endMinutes);
      slots.push({ calendarId, time: timeString });
    }

    return slots;
  }

  public async generateFreeSlots(
    userId: string,
    date_: string,
    customWorkTime?: string,
    calendarDay?: Calendar,
  ) {
    const date = new Date(date_);

    const settings = await this._getUserSettings(userId);
    const [startTime, endTime] = await this._getWorkTime(
      settings,
      customWorkTime,
    );

    if (!calendarDay || calendarDay.state === 'notHave') {
      return [];
    }
    const calendarId = calendarDay.id;
    const { startMinutes, endMinutes, breakMinutes, granularityMinutes } =
      await this._calculateTimeBoundaries(startTime, endTime, settings);
    const existingAppointments = await this._getExistingAppointments(
      userId,
      date,
    );

    const slotsToCreate = await this._generateSlots(
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

    const userSettings = await this._getUserSettings(userId);
    const breakMinutes = await this._convertTimeToMinutes(
      userSettings.defaultBreakTime,
    );

    const granularityMinutes = await this._convertTimeToMinutes(
      userSettings.timeGranularity,
    );

    const calendarDay = await this._calendarService.findByUserDate(
      userId,
      date,
    );
    if (!calendarDay) {
      throw new HttpException('День не найден в календаре', 404);
    }
    if (calendarDay.state === DayState.notHave) {
      throw new HttpException('Этот день недоступен для записи', 400);
    }

    const startFreeSlot = await this._freeSlotService.findUniqueSlot(
      calendarDay.id,
      time,
    );
    if (!startFreeSlot) {
      throw new HttpException('Слот не найден', 404);
    }
    if (startFreeSlot.isBooked) {
      throw new HttpException('Слот уже занят', 409);
    }

    const totalServiceDuration = await this._getServicesDuration(serviceIds);

    const existingDirects = await this._directsService.findByDateUser(
      userId,
      date,
    );

    const filteredDirects = existingDirects.filter(
      (direct) => direct.state !== DirectsState.cancelled,
    );

    const appointments = await Promise.all(
      filteredDirects.map(async (direct) => {
        const servicesDuration = await direct.services.reduce(
          async (accPromise, ds) => {
            const acc = await accPromise;
            const serviceMinutes = await this._convertTimeToMinutes(
              ds.service.time,
            );
            return acc + serviceMinutes;
          },
          Promise.resolve(0),
        );
        const startTime = await this._convertTimeToMinutes(direct.time);
        return {
          start: startTime,
          end: startTime + servicesDuration,
          id: direct.id,
        };
      }),
    );

    appointments.sort((a, b) => a.start - b.start);

    const newAppointmentStart = await this._convertTimeToMinutes(time);
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

    const direct = await this._directsService.createDirect(
      createDirectDto,
      calendarId,
    );

    let currentTime = newAppointmentStart;
    while (currentTime < newAppointmentEnd) {
      const currentTimeString = await this._formatMinutesToTime(currentTime);
      const currentSlot = await this._freeSlotService.findUniqueSlot(
        calendarDay.id,
        currentTimeString,
      );

      if (currentSlot) {
        await this._freeSlotService.updateSlotBooking(currentSlot.id, true);
      }

      currentTime += granularityMinutes;
    }

    const minServiceDuration = await this._getMinimumServiceDuration(userId);
    const hasFreeSlots = await this._hasFreeSlots(calendarDay.id);

    if (hasFreeSlots) {
      let maxAvailableTime = 0;
      let currentAvailableTime = 0;

      const [startTime, endTime] = userSettings.defaultWorkTime.split('-');
      let startMinutes = await this._convertTimeToMinutes(startTime);
      const endMinutes = await this._convertTimeToMinutes(endTime);

      while (startMinutes < endMinutes) {
        const timeString = await this._formatMinutesToTime(startMinutes);
        const currentSlot = await this._freeSlotService.findUniqueSlot(
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
        await this._calendarService.updateDayState(
          calendarDay.id,
          DayState.full,
        );
      } else {
        await this._calendarService.updateDayState(
          calendarDay.id,
          DayState.have,
        );
      }
    } else {
      await this._calendarService.updateDayState(calendarDay.id, DayState.full);
    }

    return { ...createDirectDto, directId: direct.id };
  }
}
