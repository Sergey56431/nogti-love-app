import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {DirectsService} from './directs.service';
import {CreateDirectDto, UpdateDirectDto} from './dto';
import {TokenGuard} from "../auth";

@UseGuards(TokenGuard)
@Controller('directs')
export class DirectsController {
  constructor(private readonly _directsService: DirectsService) {}

  @Post()
  public async create(@Body('direct') createDirectDto: CreateDirectDto) {
    try {
      return await this._directsService.create(createDirectDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Необработанная ошибка:', error);
        throw new NotFoundException({ message: 'Внутренняя ошибка сервера', code: 404 });
      }
    }
  }

  @Get()
  public async handleDirectsQuery(
      @Query('date') date?: string,
      @Query('userId') userId?: string,
      @Query('id') id?: string,
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
    @Query('id') id: string,
    @Body('direct') updateDirectDto: UpdateDirectDto,
  ) {
    return await this._directsService.update(id, updateDirectDto);
  }

  @Delete()
  public async remove(@Query('id') id?: string) {
    return await this._directsService.remove(id);
  }
}
