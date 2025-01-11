import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { IncomExpencesService } from './incom_expences.service';
import {
  CreateIncomeExpencesDto,
  UpdateIncomeExpences,
} from './dto/create-incom_expence.dto';

@Controller('operation')
export class IncomeExpencesController {
  constructor(private readonly incomeExpencesService: IncomExpencesService) {}

  @Post(':id')
  public async create(
    @Body() createIncomExpenceDto: CreateIncomeExpencesDto,
    @Param('id') userId: string,
  ) {
    return this.incomeExpencesService.create(createIncomExpenceDto, userId);
  }

  @Get(':id')
  public async findAll(@Param('id') userId: string) {
    return this.incomeExpencesService.findAll(userId);
  }

  @Get(':userId/:id')
  public async findOne(
    @Param('id') id: number,
    @Param('userId') userId: string,
  ) {
    return this.incomeExpencesService.findOne(+id, userId);
  }

  @Put(':userId/:id')
  public async update(
    @Param('id') id: number,
    @Param('userId') userId: string,
    @Body() updateIncomExpenceDto: UpdateIncomeExpences,
  ) {
    return this.incomeExpencesService.update(
      +id,
      userId,
      updateIncomExpenceDto,
    );
  }

  @Delete(':userId/:id')
  public async remove(
    @Param('id') id: number,
    @Param('userId') userId: string,
  ) {
    return this.incomeExpencesService.remove(+id, userId);
  }
}
