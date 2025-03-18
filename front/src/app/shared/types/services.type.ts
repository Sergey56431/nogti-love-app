export interface ServicesType {
  service: Services
}

export interface Services {
  id?: string;
  name: string;
  time: string;
  price: number;
  categoryId: string;
}
