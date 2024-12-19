import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Имя пользователя',
    nullable: false,
    required: false,
    example: 'test Updated',
  })
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    nullable: false,
    required: false,
    example: 'test Updated',
  })
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Номер телефона пользователя',
    nullable: true,
    required: false,
    example: '+799999990',
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
    example: '26.05.2021',
  })
  birthDate?: Date;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
