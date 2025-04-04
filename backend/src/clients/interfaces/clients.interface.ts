import { CreateClientsDto, UpdateClientsDto } from '../dto';

export interface IClientsService {
  findOne(id);
  findAll();
  findPhoneClient(phoneNumber: string);
  findByMaster(masterId: string);
  createClient(createClientsDto: CreateClientsDto);
  updateClient(id: string, data: UpdateClientsDto);
  deleteClient(id: string);
}
