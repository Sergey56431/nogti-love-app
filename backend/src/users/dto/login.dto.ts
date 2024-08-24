import { IsNotEmpty, IsString} from "class-validator"

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string
    @IsNotEmpty()
    readonly password: string
}
