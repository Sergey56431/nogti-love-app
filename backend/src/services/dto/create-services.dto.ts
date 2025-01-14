
export class CreateServicesDto {
    id: string;
    name: string;
    time: Date | string;
    price: number;
    categoryId: string;
}

export type UpdateServicesDto = Partial<CreateServicesDto>;