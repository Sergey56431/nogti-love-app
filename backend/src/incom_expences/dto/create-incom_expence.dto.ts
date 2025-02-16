import { TypeOperation } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncomeExpencesDto {
  @ApiProperty({
    description: 'ID пользователя',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;

  @ApiProperty({
    description: 'Категория операции',
    nullable: false,
    example: 'Кредит',
  })
  category: string;

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

export type UpdateIncomeExpences = Partial<CreateIncomeExpencesDto>;
