import { Role } from '.prisma/client';

export class UserCreateDto {
  name: string;
  lastName: string;
  username: string;
  password: string;
  phoneNumber: string;
  id?: string;
  role?: Role;
  score?: number;
  calendar?: [];
  //refreshToken?: string;
}

export type TUserUpdateDto = Partial<UserCreateDto>;
