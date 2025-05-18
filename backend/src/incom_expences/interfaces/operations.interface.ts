import {
  CreateOperationsDto,
  FindOperationsDto,
  UpdateOperationsDto,
} from '../dto';
import { Income_Expanses } from '@prisma/client';

export interface IOperationsService {
  create(createIncomExpenceDto: CreateOperationsDto);
  find(
    filters: FindOperationsDto,
  ): Promise<Income_Expanses[] | Income_Expanses>;
  update(id: string, updateIncomExpenceDto: UpdateOperationsDto);
  remove(id: string): Promise<void>;
}
