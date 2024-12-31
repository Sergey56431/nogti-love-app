import { Role } from '.prisma/client';

export class UserCreateDto {
  id: string;
  name: string;
  lastName: string;
  username: string;
  password: string;
  phoneNumber: string;
  role: Role;
  score: number;
}

export type TUserUpdateDto = Partial<UserCreateDto>;
