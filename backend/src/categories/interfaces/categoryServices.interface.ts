import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

export interface ICategoryServices {
  create(data: CreateCategoryDto);
  findAll();
  findOne(id: string);
  findByUser(userId: string);
  update(id: string, data: UpdateCategoryDto);
  remove(id: string);
}
