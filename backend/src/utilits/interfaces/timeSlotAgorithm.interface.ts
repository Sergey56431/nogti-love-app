import { Calendar } from '@prisma/client';

export interface ITimeSlotAlgorithm {
  generateFreeSlots(
    userId: string,
    date: string,
    customWorkTime?: string,
    calendarDay?: Calendar,
  ): Promise<{ calendarId: string; time: string }[]>;
  bookSlot(
    userId: string,
    dateStr: string,
    time: string,
    serviceIds: string[],
    clientName: string,
    phone: string,
    comment: string | undefined,
    calendarId: string,
  ): Promise<any>;
}
