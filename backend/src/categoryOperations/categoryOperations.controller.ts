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
import { CategoryOperationsService } from './categoryOperations.service';
import { CreateCategoryOperationsDto, UpdateCategoryOperationsDto } from './dto';
import { TokenGuard } from '../auth';
import { UpdateCategoryDto } from '../categories/dto';

@UseGuards(TokenGuard)
@Controller('categoryOperations')
export class CategoryOperationsController {
  constructor(private readonly categoryOperationsService: CategoryOperationsService) {}

  @Post()
  create(@Body() createCategoryOperationsDto: CreateCategoryOperationsDto) {
    return this.categoryOperationsService.create(createCategoryOperationsDto);
  }
  @Get()
  findOne(@Query('id') id: string, @Query('userId') userId: string) {
    if (id) {
      return this.categoryOperationsService.findOne(id);
    } else if (userId) {
      return this.categoryOperationsService.findByUser(userId);
    } else {
      return this.categoryOperationsService.findAll();
    }
  }
  @Put()
  update(
    @Query('id') id: string,
    @Body() UpdateCategoryOperationsDto: UpdateCategoryOperationsDto,
  ) {
    return this.categoryOperationsService.update(id, UpdateCategoryOperationsDto);
  }
  @Delete()
  remove(@Query('id') id: string) {
    return this.categoryOperationsService.remove(id);
  }
}

