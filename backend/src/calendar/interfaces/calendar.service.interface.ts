import { CreateCalendarDto, UpdateCalendarDto } from '../dto';
import { Calendar } from '@prisma/client';
import { CreateCalendarAllDto } from '../dto/create-calendar-all.dto';

export interface ICalendarService {
  create(createCalendarDto: CreateCalendarDto): Promise<Calendar>;
  create_all(data: CreateCalendarAllDto): Promise<Calendar[]>;
  findAll(): Promise<Calendar[]>;
  findByUser(userId: string): Promise<Calendar[]>;
  findOne(id: string): Promise<Calendar | null>;
  findInterval(startDate: string, endDate: string): Promise<Calendar[]>;
  update(id: string, updateCalendarDto: UpdateCalendarDto): Promise<Calendar>;
  remove(id: string): Promise<Calendar>;
}
