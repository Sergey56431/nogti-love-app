import { ServicesService } from '../services';
import { SettingsService } from '../settings';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { FreeSlotsService } from '../freeSlots';
import { CategoryService } from '../categories';
import { IServicesService } from '../services/interfaces';
import { ISettingService } from '../settings/interfaces';
import { IFreeSlotsService } from '../freeSlots/interfaces';
import { ICategoryServices } from '../categories/interfaces';
import { ITimeSlotUtilits } from './interfaces';

interface UserSettings {
  userId: string;
  settingsData: { name: string; value: string }[];
}

interface TimeBoundaries {
  startMinutes: number;
  endMinutes: number;
  breakMinutes: number;
  granularityMinutes: number;
}

class TimeInterval {
  constructor(
    public start: number,
    public end: number,
  ) {}
}

@Injectable()
export class TimeSlotUtilits implements ITimeSlotUtilits {
  constructor(
    @Inject(ServicesService)
    private readonly _servicesService: IServicesService,
    @Inject(SettingsService)
    private readonly _settingsService: ISettingService,
    @Inject(FreeSlotsService)
    private readonly _freeSlotService: IFreeSlotsService,
    @Inject(CategoryService)
    private readonly _categoryService: ICategoryServices,
  ) {}

  // ------------------ Вспомогательные методы
  public async convertTimeToMinutes(time: string): Promise<number> {
    const time1: string[] = time.split(':');
    return +time1[0] * 60 + +time1[1];
  }

  public async formatMinutesToTime(minutes: number): Promise<string> {
    return `${Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`; //возвращает строку типа "02:23"; `округляем/только в меньшую(minutes / 60):остаток при делении minutes на 60`
  }

  // ------------------ Методы получения данных

  public async getServicesDuration(serviceIds: string[]): Promise<number> {
    let alltime: number = 0;
    for (const id of serviceIds) {
      const service = await this._servicesService.findOne(id);
      alltime += await this.convertTimeToMinutes(service.time);
    }
    return alltime;
  }

  public async getUserSettings(userId: string): Promise<any> {
    const settings = await this._settingsService.findByUser(userId);
    if (!settings) {
      throw new HttpException(
        `Настройки не найдены для пользователя: ${userId}`,
        404,
      );
    }
    return settings;
  }

  public async getMinimumServiceDuration(userId: string): Promise<number> {
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
        const duration = await this.convertTimeToMinutes(service.time);
        if (duration < minDuration) {
          minDuration = duration;
        }
      }
    }
    return minDuration;
  }

  public async hasFreeSlots(calendarId: string): Promise<boolean> {
    const freeSlots = await this._freeSlotService.findAllFreeSlots(calendarId);
    return !!freeSlots;
  }

  public async getWorkTime(
    settings: UserSettings,
    customWorkTime?: string,
  ): Promise<[string, string]> {
    const workTime = customWorkTime || settings.settingsData[0].value;
    return workTime.split('-') as [string, string];
  }

  // ----------------- Основная логика генерации окон

  public async calculateTimeBoundaries(
    startTime: string,
    endTime: string,
    settings: UserSettings,
  ): Promise<TimeBoundaries> {
    const startMinutes = await this.convertTimeToMinutes(startTime);
    const endMinutes = await this.convertTimeToMinutes(endTime);
    const breakMinutes = await this.convertTimeToMinutes(
      settings.settingsData[2].value,
    );
    const granularityMinutes = await this.convertTimeToMinutes(
      settings.settingsData[1].value,
    );
    return { startMinutes, endMinutes, breakMinutes, granularityMinutes };
  }

  public async generateSlots(
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
        const timeString = await this.formatMinutesToTime(currentTime);
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
      const timeString = await this.formatMinutesToTime(endMinutes);
      slots.push({ calendarId, time: timeString });
    }

    return slots;
  }
}
