import { ServicesType } from './services.type';

export interface FavorsResponse {
  id?: string;
  name: string;
  userId: string;
  services?: ServicesType[]
}
