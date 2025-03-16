export class UserCreateDto {
  name: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  rate?: number;
  birthday?: Date;
  description?: string;
  refreshToken?: string;
  id?: string;
  score?: number;
}

export type TUserUpdateDto = Partial<UserCreateDto>;
