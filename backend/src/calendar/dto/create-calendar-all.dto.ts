import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarAllDto {
  @ApiProperty({
    description: 'Массив нерабочих дней',
    nullable: false,
    type: Array<{ date: string }>,
    example: [{ date: '2025-03-16' }, { date: '2025-03-17' }],
  })
  noWorkDays: { date: string }[];

  @ApiProperty({
    description: 'ID пользвателя (создателя календаря)',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;
}
