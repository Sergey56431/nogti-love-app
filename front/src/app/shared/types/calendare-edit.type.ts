import { DayState } from '@shared/utils';

export interface CalendarEditType {
  customDays: CustomDay[],
  userId: string,
  dateForCreate: string
}

export interface CustomDay {
  date: string,
  state: DayState,
  workTime: string
}
