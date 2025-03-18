import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    description: 'Имя пользвателя',
    nullable: false,
    example: 'Владислав',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Фамилия пользвателя',
    nullable: true,
    example: 'Никифоров',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Имя пользвателя',
    nullable: false,
    example: 'Vladislav2004',
  })


  @ApiProperty({
    description: 'Номер телефона пользвателя',
    nullable: false,
    example: '89502151980',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Пароль пользвателя',
    nullable: false,
    example: 'lolkek2000',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'День рождения пользвателя',
    nullable: true,
    example: '2004-07-20',
  })
  @IsDate()
  birthday: Date;
}
