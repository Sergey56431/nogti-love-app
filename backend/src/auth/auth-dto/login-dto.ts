import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Телефон пользвателя',
    nullable: false,
    example: '89502151980',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Пароль пользвателя',
    nullable: false,
    example: 'lolkek2000',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
