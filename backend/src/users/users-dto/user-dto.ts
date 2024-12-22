import { Role } from '.prisma/client';

export class UserDto {
  name: string;
  lastName: string;
  username: string;
  password: string;
  phoneNumber: string;
  role: Role;
  score: number;
}
