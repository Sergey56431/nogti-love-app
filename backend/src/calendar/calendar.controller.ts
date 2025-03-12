import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  UseGuards,
  Query,
  Inject,
} from '@nestjs/common';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CustomSwaggerCreateCalendarResponses,
  CustomSwaggerGetCalendarResponses,
  CustomSwaggerUpdateCalendarResponse,
} from '../custom-swagger';
import { CreateCalendarAllDto } from './dto/create-calendar-all.dto';
import { DayState } from '@prisma/client';
import { ICalendarService } from './interfaces';

@UseGuards(TokenGuard)
@ApiTags('Calendar (Календарь)')
@Controller('calendar')
export class CalendarController {
  constructor(
    @Inject('ICalendarService')
    private readonly _calendarService: ICalendarService,
  ) {}

  @Post()
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this._calendarService.create(createCalendarDto);
  }

  @ApiOperation({ summary: 'Создать календарь на месяц' })
  @ApiBody({ type: CreateCalendarAllDto })
  @CustomSwaggerCreateCalendarResponses()
  @ApiResponse({ status: 400, description: 'Отсутствует ID пользователя' })
  @ApiResponse({
    status: 404,
    description: 'Дата не находится в текущем месяце / Пользователь не найден',
  })
  @ApiResponse({ status: 500, description: 'Ошибка при создании календаря' })
  @Post('all')
  create_all(
    @Body()
    data: CreateCalendarAllDto,
  ) {
    return this._calendarService.create_all(data);
  }

  @ApiOperation({
    summary: 'Получить календарь (опционально)',
  })
  @ApiParam({
    description: 'ID дня календаря',
    required: false,
    name: 'id',
    example: 'b35d8ac4-a6de-45f6-b54d-2b9e45ce8089',
  })
  @ApiParam({
    description: 'ID пользователя',
    name: 'userId',
    required: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  @CustomSwaggerGetCalendarResponses()
  @ApiResponse({
    status: 404,
    description: 'День не найден / Календарь этого пользователя не найден',
  })
  @ApiResponse({
    status: 500,
    description:
      'Ошибка при поиске всего календаря / Ошибка сервера при поиске календаря / Ошибка сервера при поиске дня календаря',
  })
  @Get()
  find(
    @Query('id') id: string,
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (id) {
      return this._calendarService.findOne(id);
    } else if (userId) {
      return this._calendarService.findByUser(userId);
    } else if (startDate && endDate) {
      return this._calendarService.findInterval(startDate, endDate);
    } else {
      return this._calendarService.findAll();
    }
  }

  @ApiOperation({ summary: 'Обновить день календаря' })
  @ApiParam({
    name: 'id',
    description: 'ID дня календаря',
    example: 'b35d8ac4-a6de-45f6-b54d-2b9e45ce8089',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: Object.values(DayState),
        },
      },
    },
  })
  @CustomSwaggerUpdateCalendarResponse()
  @ApiResponse({ status: 404, description: 'День календаря не найден' })
  @ApiResponse({
    status: 500,
    description: 'Ошибка сервера при обновлении дня календаря',
  })
  @Put()
  update(
    @Query('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this._calendarService.update(id, updateCalendarDto);
  }

  @ApiOperation({ summary: 'Удалить день календаря' })
  @ApiQuery({
    name: 'id',
    description: 'ID дня календаря для удаления',
    example: 'b35d8ac4-a6de-45f6-b54d-2b9e45ce8089',
  })
  @ApiOkResponse({ description: 'День календаря успешно удален' })
  @ApiNotFoundResponse({ description: 'День календаря не найден' })
  @Delete()
  remove(@Query('id') id: string) {
    return this._calendarService.remove(id);
  }
}
