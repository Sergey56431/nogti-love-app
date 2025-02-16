import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Имя пользвателя',
    nullable: false,
    example: 'Vladislav2004',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Пароль пользвателя',
    nullable: false,
    example: 'lolkek2000',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
