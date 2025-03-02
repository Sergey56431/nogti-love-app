import { DirectsClientType } from '@shared/types/directs-client.type';

export interface CalendarResponse {
    id: string,
    date: string,
    state: string,
    userId: string
    directs: DirectsClientType[]
}

export interface CreateCalendarType extends CalendarResponse {
  userId: string,
}

export interface NotWorksDaysCalendarType {
  userId: string,
  noWorkDays: {
    date: string
  }[]
}
