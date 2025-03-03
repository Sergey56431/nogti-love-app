import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingsDto {
  @ApiProperty({
    description: 'ID пользователя',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;

  @ApiProperty({
    description: 'Дефолтное рабочее время',
    nullable: false,
    example: '09:00-16:00',
  })
  defaultWorkTime: string;

  @ApiProperty({
    description: 'Дефолтное время перерыва',
    nullable: false,
    example: '00:30',
  })
  defaultBreakTime: string;

  @ApiProperty({
    description: 'Дефолтное время дробления',
    nullable: false,
    example: '00:30',
  })
  timeGranularity: string;
}

export type UpdateSettingsDto = Partial<CreateSettingsDto>;
