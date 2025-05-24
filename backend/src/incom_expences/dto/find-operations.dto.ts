import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { TypeOperation } from '@prisma/client';

export class FindOperationsDto {
  @ApiPropertyOptional({
    description: 'ID операции для поиска конкретной операции',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({
    description: 'ID пользователя для поиска его операций',
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'ID категории операции',
    example: 'c1d2e3f4-a5b6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    enum: TypeOperation,
    description: 'Тип операции (доход/расход)',
    example: TypeOperation.expense,
  })
  @IsOptional()
  @IsEnum(TypeOperation)
  type?: TypeOperation;

  @ApiPropertyOptional({
    description: 'Минимальное значение операции',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valueMin?: number;

  @ApiPropertyOptional({
    description: 'Максимальное значение операции',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valueMax?: number;

  @ApiPropertyOptional({
    description: 'Дата начала периода (ISO строка, YYYY-MM-DD)',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Дата окончания периода (ISO строка, YYYY-MM-DD)',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
