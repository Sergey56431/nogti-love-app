import { IsString, IsUUID } from 'class-validator';


export class CreateCategoryOperationsDto {
  @IsString()
  name: string;

  @IsUUID()
  userId: string;
}

export type UpdateCategoryOperationsDto = Partial<CreateCategoryOperationsDto>;