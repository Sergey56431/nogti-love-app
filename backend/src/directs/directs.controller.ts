import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DirectsService } from './directs.service';
import { CreateDirectDto, UpdateDirectDto } from './dto';
import { TokenGuard } from '../auth';

@UseGuards(TokenGuard)
@Controller('directs')
export class DirectsController {
  constructor(private readonly _directsService: DirectsService) {}

  @Post()
  public async create(@Body() createDirectDto: CreateDirectDto) {
    return await this._directsService.create(createDirectDto);
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
      return this._directsService.findByUser(userId);
    } else if (id) {
      return this._directsService.findOne(id);
    } else {
      return this._directsService.findAll();
    }
  }

  @Put()
  public async update(
    @Query('id') id: string,
    @Body() updateDirectDto: UpdateDirectDto,
  ) {
    return await this._directsService.update(id, updateDirectDto);
  }

  @Delete()
  public async remove(@Query('id') id?: string) {
    return await this._directsService.remove(id);
  }
}
