import {CreateServicesDto} from "../../services/dto/create-services.dto";

export class CreateCategoryDto {
    id: string;
    name: string;
    userId: string;
    services?: CreateServicesDto[];
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;