import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsDate,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Имя пользователя',
    nullable: false,
    example: 'test',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    nullable: false,
    example: 'test',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Номер телефона пользователя',
    nullable: true,
    required: false,
    example: '+799999999',
  })
  @IsOptional()
  @IsPhoneNumber(null)
  phoneNumber?: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: 'Дата рождения пользователя',
    nullable: true,
    required: false,
    example: '26.05.2022',
  })
  birthDate?: Date;
}
