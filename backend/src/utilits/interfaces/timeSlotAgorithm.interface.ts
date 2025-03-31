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

export interface ITimeSlotUtilits {
  convertTimeToMinutes(time: string): Promise<number>;
  formatMinutesToTime(minutes: number): Promise<string>;
  getServicesDuration(serviceIds: string[]): Promise<number>;
  getUserSettings(userId: string): Promise<UserSettings>;
  getMinimumServiceDuration(userId: string): Promise<number>;
  hasFreeSlots(calendarId: string): Promise<boolean>;
  getWorkTime(
    settings: UserSettings,
    customWorkTime?: string,
  ): Promise<[string, string]>;
  calculateTimeBoundaries(
    startTime: string,
    endTime: string,
    settings: UserSettings,
  ): Promise<TimeBoundaries>;
  generateSlots(
    startMinutes: number,
    endMinutes: number,
    granularityMinutes: number,
    breakMinutes: number,
    existingAppointments: TimeInterval[],
    calendarId: string,
  ): Promise<{ calendarId: string; time: string }[]>;
}
