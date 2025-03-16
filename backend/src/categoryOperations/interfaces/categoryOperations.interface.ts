import {
  CreateCategoryOperationsDto,
  UpdateCategoryOperationsDto,
} from '../dto';

export interface ICategoryOperationsService {
  create(data: CreateCategoryOperationsDto);
  findAll();
  findOne(id: string);
  findByUser(userId: string);
  update(id: string, data: UpdateCategoryOperationsDto);
  remove(id: string);
}
