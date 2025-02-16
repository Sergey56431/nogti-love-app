import { CreateServicesDto } from '../../services/dto/create-services.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    nullable: false,
    example: 'Маникюр',
  })
  name: string;

  @ApiProperty({
    description: 'ID пользователя',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;
  services?: CreateServicesDto[];
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
