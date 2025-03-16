export class RoleCreateDto {
  id?: string;
  name: string;
  userId: string;
}
export type RoleUpdateDto = Partial<RoleCreateDto>;
