import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put, Query,
} from '@nestjs/common';
import { IncomExpencesService } from './incom_expences.service';
import {
  CreateIncomeExpencesDto,
  UpdateIncomeExpences,
} from './dto';

@Controller('operation')
export class IncomeExpencesController {
  constructor(private readonly incomeExpencesService: IncomExpencesService) {}

  @Post()
  public async create(
    @Body() createIncomExpenceDto: CreateIncomeExpencesDto,
    @Query('userId') userId: string,
  ) {
    return this.incomeExpencesService.create(createIncomExpenceDto, userId);
  }

  @Get()
  public async findAll(
      @Query('userId') userId: string,
      @Query('id') id: string) {
    if (userId) {
      return this.incomeExpencesService.findByUser(userId);
    } else if (id) {
      return this.incomeExpencesService.findOne(id);
    }else
      return this.incomeExpencesService.findAll()
  }

  @Put()
  public async update(
    @Query('id') id: string,
    @Body() updateIncomExpenceDto: UpdateIncomeExpences,
  ) {
    return this.incomeExpencesService.update(
      id,
      updateIncomExpenceDto,
    );
  }

  @Delete()
  public async remove(
    @Query('id') id: string,
  ) {
    return this.incomeExpencesService.remove(id);
  }
}
