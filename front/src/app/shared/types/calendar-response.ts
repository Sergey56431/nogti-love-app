import { DirectsClientType } from '@shared/types/directs-client.type';
import { DayState } from '@shared/utils';

export interface CalendarResponse {
  day: number;
  date: string;
  directs?: DirectsClientType[];
  freeSlots?: string[];
  id?: string;
  state?: DayState;
  time?: string;
  userId?: string;
}

export interface CreateCalendarType extends CalendarResponse {
  userId: string,
}

export interface NotWorksDaysCalendarType {
  userId: string,
  noWorkDays: {
    date: string | null
  }[]
}
