import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBody, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam, ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CustomSwaggerCreateCalendarResponses,
  CustomSwaggerGetCalendarResponses, CustomSwaggerUpdateCalendarResponse,
} from '../custom-swagger';
import { CreateCalendarAllDto } from './dto/create-calendar-all.dto';

@UseGuards(TokenGuard)
@ApiTags('Calendar (Календарь)')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.create(createCalendarDto);
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
    data: {
      noWorkDays: CreateCalendarDto[];
      userId: string;
    },
  ) {
    return this.calendarService.create_all(data);
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
  findOne(@Query('id') id: string, @Query('userId') userId: string) {
    if (id) {
      return this.calendarService.findOne(id);
    } else if (userId) {
      return this.calendarService.findByUser(userId);
    } else {
      return this.calendarService.findAll();
    }
  }

  @ApiOperation({ summary: 'Обновить день календаря' })
  @ApiParam({
    name: 'id',
    description: 'ID дня календаря',
    example: 'b35d8ac4-a6de-45f6-b54d-2b9e45ce8089',
  })
  @ApiBody({
    description: 'Данные для обновления дня календаря (Сломалось)',
    examples: {
      'Пример запроса': {
        value: {
          date: '2024-03-15',
          state: 'notHave',
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
    return this.calendarService.update(id, updateCalendarDto);
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
    return this.calendarService.remove(id);
  }
}
