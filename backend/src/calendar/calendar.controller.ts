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
  create(
    @Body()
    data: {
      body: CreateCalendarDto;
      userId: string;
    },
  ) {
    return this.calendarService.create(data);
  }

  @Post('all')
  create_all(
      @Body()
      data: {
        noWorkDays: CreateCalendarDto[];
        userId: string;
    }
  ) {
    return this.calendarService.create_all(data);
  }

  @Get()
  findOne(
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

  @Delete()
  remove(@Query('id') id: string) {
    return this.calendarService.remove(id);
  }
}
