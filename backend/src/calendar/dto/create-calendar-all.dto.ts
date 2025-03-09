import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayState } from '@prisma/client';

class CustomDayDto {
  @ApiProperty({ example: '2024-03-08', description: 'Дата' })
  @IsDateString()
  date: string;

  @ApiProperty({
    enum: DayState,
    example: DayState.empty,
    description: 'Состояние дня',
    required: false,
  })
  @IsOptional()
  @IsEnum(DayState)
  state?: DayState;

  @ApiProperty({
    example: '10:00-18:00',
    description: 'Кастомное рабочее время',
    required: false,
  })
  @IsOptional()
  @IsString()
  workTime?: string;
}

export class CreateCalendarAllDto {
  @ApiProperty({
    type: [CustomDayDto],
    description: 'Массив кастомных дней',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomDayDto)
  customDays: CustomDayDto[];

  @ApiProperty({
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
    description: 'ID пользователя',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '2024-03', description: 'Месяц для создания' })
  @IsString()
  @IsNotEmpty()
  dateForCreate: string;
}
