import { DayState, Calendar } from '@prisma/client';

export interface ICalendarServiceAlgorithm {
  updateDayState(dayId: string, newState: DayState): Promise<void>;
  findByUserDate(userId: string, date: Date): Promise<Calendar | null>;
}
