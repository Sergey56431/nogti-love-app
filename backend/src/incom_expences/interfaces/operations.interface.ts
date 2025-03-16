import { CreateOperationsDto, UpdateOperationsDto } from '../dto';

export interface IOperationsService {
  create(createIncomExpenceDto: CreateOperationsDto);
  findByUser(userId: string);
  findAll();
  findOne(id: string);
  update(id: string, updateIncomExpenceDto: UpdateOperationsDto);
  remove(id: string): Promise<void>;
}
