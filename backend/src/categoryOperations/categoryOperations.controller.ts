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

@UseGuards(TokenGuard)
@Controller('categoryOperations')
export class CategoryOperationsController {
  constructor(private readonly categoryOperationsService: CategoryOperationsService) {}

  @Post()
  create(@Body() createCategoryOperationsDto: CreateCategoryOperationsDto) {
    return this.categoryOperationsService.create(createCategoryOperationsDto);
  }
}