import { CreateClientsDto, UpdateClientsDto } from '../dto';

export interface IClientsService {
  findOne(id);
  findAll();
  findByMaster(masterId: string);
  createClient(createClientsDto: CreateClientsDto);
  updateClient(id: string, data: UpdateClientsDto);
  deleteClient(id: string);
}
