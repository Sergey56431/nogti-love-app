import { TypeOperation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOperationsDto {
  @ApiProperty({
    description: 'ID пользователя',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;

  @ApiProperty({
    description: 'ID категории операции',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Сумма операции',
    nullable: false,
    example: '12500',
  })
  value: number;

  @ApiProperty({
    description: 'Тип операции',
    nullable: false,
    example: 'expense',
    enum: TypeOperation,
  })
  type: TypeOperation;
}

export type UpdateOperationsDto = Partial<CreateOperationsDto>;
