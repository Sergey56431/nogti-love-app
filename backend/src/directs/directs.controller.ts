import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
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

  @Get(':userId')
  public async findAll(@Param('id') userId: string) {
    return await this._directsService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this._directsService.findOne(+id);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body('direct') updateDirectDto: UpdateDirectDto,
  ) {
    return await this._directsService.update(+id, updateDirectDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this._directsService.remove(+id);
  }
}
