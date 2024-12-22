import { IsDate, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;
  @IsString()
  lastName: string;
  @IsString()
  username: string;
  @IsString()
  phoneNumber: string;
  @IsString()
  password: string;
  @IsDate()
  birthday: Date;
}
