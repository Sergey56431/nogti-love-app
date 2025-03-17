import { CreateServicesDto, UpdateServicesDto } from '../dto';

export interface IServicesService {
  create(data: CreateServicesDto);
  findAll();
  findOne(id: string);
  findByCategory(id: string);
  update(id: string, data: UpdateServicesDto);
  remove(id: string);
}
