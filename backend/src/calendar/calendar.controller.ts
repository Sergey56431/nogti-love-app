import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards, Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { TokenGuard } from '../auth';

@UseGuards(TokenGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  async create(
    @Body()
    data: {
      body: CreateCalendarDto;
      userId: string;
    },
  ) {
    return await this.calendarService.create(data);
  }

  @Get()
  public async findOne(
      @Query('id') id: string,
      @Query('userId') userId: string
  ) {
    if (id) {
      return this.calendarService.findOne(id);
    } else if (userId) {
      return this.calendarService.findByUser(userId);
    } else {
      return this.calendarService.findAll();
    }

  }

  @Put()
  update(
    @Query('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this.calendarService.update(id, updateCalendarDto);
  }

  //@Post() - Отпрявляет не рабочие дни (должно генерировать на месяц )

  @Delete()
  public async remove(@Query('id') id: string) {
    return this.calendarService.remove(id);
  }
}
