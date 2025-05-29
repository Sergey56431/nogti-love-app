import { IsOptional, IsUUID } from 'class-validator';

export class CreateClientsDto {
  name: string;
  lastName: string;
  phoneNumber: string;
  rate?: number;
  birthday?: Date;
  description?: string;
  refreshToken?: string;
  masterId?: string;
  roleId?: string;
  score?: number;
  password: string;
  @IsUUID()
  @IsOptional()
  referrerId?: string;
}

export type UpdateClientsDto = Partial<CreateClientsDto>;
