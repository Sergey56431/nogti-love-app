import { CreateDirectDto, UpdateDirectDto } from '../dto';
import { Directs } from '@prisma/client';

export interface IDirectsService {
  findByDate(date: string): Promise<Directs[]>;
  create(createDirectDto: CreateDirectDto): Promise<Directs>;
  findAll(): Promise<Directs[]>;
  findByUser(id: string): Promise<Directs[]>;
  findOne(id: string): Promise<Directs | null>;
  update(id: string, updateDirectDto: UpdateDirectDto): Promise<Directs>;
  remove(id: string): Promise<Directs>;
}
