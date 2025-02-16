import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateServicesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    time: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    categoryId: string;
}

export type UpdateServicesDto = Partial<CreateServicesDto>;