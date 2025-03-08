import { ServicesType } from '@shared/types/services.type';

export interface CategoriesType {
  name: string,
  id?: string,
  userId?: string
  services?: ServicesType[]
}
