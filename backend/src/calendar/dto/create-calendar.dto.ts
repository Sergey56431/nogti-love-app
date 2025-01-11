import { CreateDirectDto } from '../../directs';

export class CreateCalendarDto {
  id: string;
  date: Date | string;
  state: string;
  directs?: CreateDirectDto[];
}

export type UpdateCalendarDto = Partial<CreateCalendarDto>;
