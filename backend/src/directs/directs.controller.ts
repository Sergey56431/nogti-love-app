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
  create(@Body() createDirectDto: CreateDirectDto) {
    return this._directsService.create(createDirectDto);
  }

  @Get()
  findAll() {
    return this._directsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._directsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDirectDto: UpdateDirectDto) {
    return this._directsService.update(+id, updateDirectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._directsService.remove(+id);
  }
}
