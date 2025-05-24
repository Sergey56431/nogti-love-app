import { IsString, IsUUID } from 'class-validator';
import { TypeOperation } from '@prisma/client';

export class CreateCategoryOperationsDto {
  @IsString()
  name: string;

  type: TypeOperation;

  @IsUUID()
  userId: string;
}

export type UpdateCategoryOperationsDto = Partial<CreateCategoryOperationsDto>;
