import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServicesDto {
  @ApiProperty({
    description: 'Название услуги',
    nullable: false,
    example: 'Без покрытия',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Время услуги',
    nullable: false,
    example: '2:00',
  })
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    description: 'Цена услуги',
    nullable: false,
    example: '2000',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'ID категории',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export type UpdateServicesDto = Partial<CreateServicesDto>;
