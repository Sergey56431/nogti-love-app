import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ICategoryServices } from './interfaces';

@UseGuards(TokenGuard)
@Controller('category')
export class CategoryController {
  constructor(
    @Inject(CategoryService)
    private readonly _categoryService: ICategoryServices,
  ) {}

  @ApiOperation({ summary: 'Создать категорию' })
  @ApiBody({
    description: 'Данные для создания категории',
    examples: {
      'Пример запроса': {
        value: {
          name: 'Новая категория',
          userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Категория успешно создана',
    content: {
      'application/json': {
        example: {
          id: 'f8e7dc86-c399-475b-aa9f-be58023ae8a0',
          name: 'Новая категория',
          userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
          services: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Ошибка валидации: Нет ID пользователя / Нет названия операции',
    content: {
      'application/json': {
        example: {
          errors: [
            {
              status: 400,
              message: 'Нет ID пользователя',
            },
            {
              status: 400,
              message: 'Нет названия операции',
            },
          ],
          status: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка сервера при создании категории',
  })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this._categoryService.create(createCategoryDto);
  }

  @Get()
  findOne(@Query('id') id: string, @Query('userId') userId: string) {
    if (id) {
      return this._categoryService.findOne(id);
    } else if (userId) {
      return this._categoryService.findByUser(userId);
    } else {
      return this._categoryService.findAll();
    }
  }

  @Put()
  update(
    @Query('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this._categoryService.update(id, updateCategoryDto);
  }

  @Delete()
  remove(@Query('id') id: string) {
    return this._categoryService.remove(id);
  }
}
