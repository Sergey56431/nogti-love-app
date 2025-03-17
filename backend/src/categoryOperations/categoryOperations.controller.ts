import {
  Body,
  Controller,
  Delete,
  Get, Inject,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryOperationsService } from './categoryOperations.service';
import {
  CreateCategoryOperationsDto,
  UpdateCategoryOperationsDto,
} from './dto';
import { TokenGuard } from '../auth';
import { ICategoryOperationsService } from './interfaces';

@UseGuards(TokenGuard)
@Controller('categoryOperations')
export class CategoryOperationsController {
  constructor(
    @Inject(CategoryOperationsService)
    private readonly _categoryOperationsService: ICategoryOperationsService,
  ) {}

  @Post()
  create(@Body() createCategoryOperationsDto: CreateCategoryOperationsDto) {
    return this._categoryOperationsService.create(createCategoryOperationsDto);
  }
  @Get()
  findOne(@Query('id') id: string, @Query('userId') userId: string) {
    if (id) {
      return this._categoryOperationsService.findOne(id);
    } else if (userId) {
      return this._categoryOperationsService.findByUser(userId);
    } else {
      return this._categoryOperationsService.findAll();
    }
  }
  @Put()
  update(
    @Query('id') id: string,
    @Body() UpdateCategoryOperationsDto: UpdateCategoryOperationsDto,
  ) {
    return this._categoryOperationsService.update(
      id,
      UpdateCategoryOperationsDto,
    );
  }
  @Delete()
  remove(@Query('id') id: string) {
    return this._categoryOperationsService.remove(id);
  }
}
