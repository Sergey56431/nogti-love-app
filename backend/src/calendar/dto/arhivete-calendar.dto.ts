import {
    IsString,
    IsPhoneNumber,
    IsOptional,
    IsDate, IsNumber,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ArchivatedCalendarDto {
    @IsString()
    _id: string

    @ApiProperty({ description: "ID пользователя", nullable: false, example:'y4773jhrhhhhr74hr' })
    @IsString()
    userId: string;

    @IsOptional()
    day: Date

    @IsOptional()
    state: string
}