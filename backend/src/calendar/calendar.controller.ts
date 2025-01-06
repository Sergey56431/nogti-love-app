import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

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
  public async findAll() {
    return this.calendarService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this.calendarService.update(id, updateCalendarDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}
