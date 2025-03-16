export class RoleCreateDto{
    id: string;
    name: string;
    userId: string;
}
export type TRoleUpdateDto = Partial<RoleCreateDto>;
