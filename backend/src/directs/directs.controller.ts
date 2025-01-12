import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put, Query,
} from '@nestjs/common';
import { DirectsService } from './directs.service';
import { CreateDirectDto, UpdateDirectDto } from './dto';

@Controller('directs')
export class DirectsController {
  constructor(private readonly _directsService: DirectsService) {}

  @Post()
  public async create(@Body('direct') createDirectDto: CreateDirectDto) {
    return await this._directsService.create(createDirectDto);
  }

  @Get()
  public async handleDirectsQuery(
      @Query('date') date?: string,
      @Query('userId') userId?: string,
      @Query('id') id?: number,
  ) {
    if (date) {
      return this._directsService.findByDate(date);
    } else if (userId) {
      // Переделать метод для поиска
      return this._directsService.findAll(userId);
    } else {
      return this._directsService.findOne(id);
    }
  }

  @Put()
  public async update(
    @Query('id') id: number,
    @Body('direct') updateDirectDto: UpdateDirectDto,
  ) {
    return await this._directsService.update(id, updateDirectDto);
  }

  @Delete()
  public async remove(@Query('id') id?: number) {
    return await this._directsService.remove(id);
  }
}
