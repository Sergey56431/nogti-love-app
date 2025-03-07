import { ServicesService } from '../services';
import { SettingsService } from '../settings';

interface UserSettings {
  userId: string;
  defaultWorkTime: string; // "09:00-17:00"
  defaultBreakTime: string; // "00:10"
  timeGranularity: string; // "00:30"
}

export class TimeSlotAlgorithm {
  constructor(
    private readonly _servicesService: ServicesService,
    private readonly _settingsService: SettingsService,
  ) {}

  private async _convertTimeToMinutes(time: string): Promise<number> {
    const time1: string[] = time.split(':');
    return ((+time1[0]) * 60) + (+time1[1]);
  }
  private async _formatMinutesToTime(minutes: number): Promise<string> {
    return `${`${Math.floor(minutes / 60)}`.padStart(2, '0')}:${`${minutes % 60}`.padStart(2, '0')}`;
  }
  private async _getServicesDuration(serviceIds: string[]): Promise<number> {
    let alltime: number = 0;
    serviceIds.forEach(async (id) => {
      const timeServiseRequest = await this._servicesService.findOne(id);
      alltime += await this._convertTimeToMinutes(timeServiseRequest.time);
    });
    return alltime;
  }

  private async _getUserSettings(userId: string): Promise<UserSettings> {
    const user: UserSettings = await this._settingsService.find(userId);
    return user;
  }
}
