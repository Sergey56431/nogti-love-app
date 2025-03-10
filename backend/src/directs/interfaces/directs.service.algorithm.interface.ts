import { CreatedDirectDto, CreateDirectDto } from '../dto';
import { Directs } from '@prisma/client';

export interface IDirectsServiceAlgorithm {
  findByDateUser(userId: string, date: Date): Promise<CreatedDirectDto[]>;
  createDirect(
    createDirect: CreateDirectDto,
    calendarId: string,
  ): Promise<Directs>;
}
