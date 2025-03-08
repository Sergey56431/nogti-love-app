export interface DirectsType {
  id?: string,
  date: string,
  time: string,
  comment:string,
  phone: string,
  clientName: string,
  userId?: string,
  services: {
    serviceId: string,
  }[]
}
