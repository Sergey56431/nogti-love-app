import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectDto {
  @ApiProperty({
    description: 'ID мастера к которому запись',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId?: string;

  @ApiProperty({
    description: 'Дата записи',
    nullable: false,
    example: '2025-02-06',
  })
  date: string;

  @ApiProperty({
    description: 'Имя клиента',
    nullable: false,
    example: 'Владислав',
  })
  clientName?: string;

  @ApiProperty({
    description: 'Номер телефона клиента',
    nullable: false,
    example: '89502151980',
  })
  phone?: string;

  @ApiProperty({
    description: 'Время записи',
    nullable: false,
    example: '14:00',
  })
  time: string;

  @ApiProperty({
    description: 'Комментарий клиента',
    required: false,
    example: 'Хочу ногти подлиннее',
  })
  comment: string;

  @ApiProperty({
    description: 'Услуги',
    required: false,
    type: Array<{ serviceId: string }>,
    example: [
      { serviceId: 'bc24ea47-ddc4-4f9a-a28c-c438cfd354ba' },
      { serviceId: '9e4c5f34-87ce-4900-9497-4daad93a0b38' },
    ],
  })
  services: { serviceId: string }[];
}
export type UpdateDirectDto = Partial<CreateDirectDto>;
