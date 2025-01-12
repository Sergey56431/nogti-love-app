import { CreateDirectDto } from '../../directs';
import { DayState } from '@prisma/client';

export class CreateCalendarDto {
  id: string;
  date: Date | string;
  state: DayState;
  directs?: CreateDirectDto[];
}

export type UpdateCalendarDto = Partial<CreateCalendarDto>;
