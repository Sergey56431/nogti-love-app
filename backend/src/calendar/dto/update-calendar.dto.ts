import { PartialType } from '@nestjs/mapped-types';
import {IsDate, IsNumber, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";
import {CreateCalendarDto} from "./create-calendar.dto";

export class UpdateCalendarDto extends PartialType(CreateCalendarDto) {
    id: string

    @ApiProperty({ description: "Изменяемый день", nullable: false, required:false, example:'2024-10-20' })
    @IsDate()
    day: Date;

    @ApiProperty({ description: "Состояние дня", nullable: false, required:false, example:'Рабочий День' })
    @IsString()
    state: string;

    @ApiProperty({ description: "ID пользователя", nullable: false, required:false, example:'u56n4n5u48g38nf7f3f95' })
    @IsNumber()
    userId: string;
}
