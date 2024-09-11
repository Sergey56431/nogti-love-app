import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {
    Body,
    Controller,
    Delete,
    Get, HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards
} from "@nestjs/common";
import { TokenGuard } from "../auth/auth.guard";
import { CalendarService } from "./calendar.service";
import { UpdateCalendarDto } from "./dto/update-calendar.dto";
import {
    ApiParamUserId,
    ApiResponseCreateCelendar, ApiResponseDeleteCalendarOrArchiveCalendar,
    ApiResponseFindCalendarOrArchiveCelendarById,
    ApiResponseUpdateCelendarById
} from "../custom-swagger/api-responses";

@ApiBearerAuth()
@ApiTags('Calendar')
@UseGuards(TokenGuard)
@Controller('calendar')
export class CalendarController {
    constructor( private readonly calendarService: CalendarService) {}

    @ApiOperation({ summary: 'Создать календарь для пользователя' })
    @ApiParamUserId()
    @ApiResponseCreateCelendar()
    @HttpCode(HttpStatus.CREATED)
    @Post(':id')
    async create(@Param('id') id: string){
        return await this.calendarService.create(id);
    }


    @ApiOperation({ summary: 'Получить календарь' })
    @ApiParamUserId()
    @ApiResponseFindCalendarOrArchiveCelendarById()
    @Get(':id')
    async findById(@Param('id') id: string){
        return await this.calendarService.findById(id)
    }

    @ApiOperation({ summary: 'Получить архивный календарь' })
    @ApiParamUserId()
    @ApiResponseFindCalendarOrArchiveCelendarById()
    @Get('/archive/:id')
    async findArchiveById(@Param('id') id: string){
        return await this.calendarService.findArchivatedById(id);
    }

    @ApiOperation({ summary: 'Обновить день календаря' })
    @ApiBody({required:true, schema:{example:{state:'Не рабочий день'}}})
    @ApiParam({description:'ID дня календаря', name:'id', example:'66c23742a5e4374202602bf9'})
    @ApiResponseUpdateCelendarById()
    @Patch(':id')
    async updateById(@Param('id') id: string,
               @Body('state') state: string){
        return await this.calendarService.update(id, <UpdateCalendarDto>{state:state})
    }

    @ApiOperation({ summary: 'Удалить календарь' })
    @ApiParamUserId()
    @ApiResponseDeleteCalendarOrArchiveCalendar()
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.calendarService.clearAll(id);
    }

    @ApiOperation({ summary: 'Удалить архивный календарь' })
    @ApiParamUserId()
    @ApiResponseDeleteCalendarOrArchiveCalendar()
    @Delete('/archive/:id')
    async deleteArchive(@Param('id') id: string) {
        return await this.calendarService.clearAllArchive(id);
    }

}