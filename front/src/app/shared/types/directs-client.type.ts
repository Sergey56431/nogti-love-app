import { ServicesType } from '@shared/types/services.type';

export interface DirectsClientType {
  id?: string;
  userId?: string;
  clientName: string;
  phone: string;
  time: string;
  directsServices?: ServicesType[]
  image?: string;
  comment?: string;
}
