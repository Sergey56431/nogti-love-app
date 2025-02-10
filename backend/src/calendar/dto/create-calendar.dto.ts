import { CreateDirectDto } from '../../directs';
import { DayState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarDto {
  @ApiProperty({
    description: 'Дата',
    nullable: false,
    example: '2025-03-16',
  })
  date: Date | string;

  @ApiProperty({
    description: 'Состояние',
    nullable: false,
    example: 'empty',
  })
  state: DayState;

  @ApiProperty({
    description: 'ID пользвателя (создателя календаря)',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;
  directs?: CreateDirectDto[];
}

export type UpdateCalendarDto = Partial<CreateCalendarDto>;
