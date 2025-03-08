import { ServicesType } from '@shared/types/services.type';

export interface DirectsClientType {
  id?: string;
  userId?: string;
  clientName: string;
  phone: string;
  time: string
  services?: ServicesType[]
  image?: string;
  comment?: string;
}
