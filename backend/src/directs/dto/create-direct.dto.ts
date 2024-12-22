export class CreateDirectDto {
  date: string;
  name: string;
  image: string;
  phone: string;
  time: string;
  comment: string;
}
export type UpdateDirectDto = Partial<CreateDirectDto>;
