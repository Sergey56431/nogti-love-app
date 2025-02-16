export class CreateDirectDto {
  userId?: string;
  date: string;
  clientName?: string;
  image?: string;
  phone?: string;
  time: string;
  comment: string;
}
export type UpdateDirectDto = Partial<CreateDirectDto>;
