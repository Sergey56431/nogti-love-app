import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncomExpencesService } from './incom_expences.service';
import { CreateIncomeExpencesDto, UpdateIncomeExpences } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@UseGuards(TokenGuard)
@Controller('operation')
export class IncomeExpencesController {
  constructor(private readonly incomeExpencesService: IncomExpencesService) {}

  @ApiOperation({ summary: 'Создать операцию дохода/расхода' })
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя',
    required: true,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  @ApiBody({
    description: 'Данные для создания операции',
    examples: {
      'Пример запроса': {
        value: {
          type: 'income',
          value: 1500,
          category: 'salary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Операция успешно создана',
    content: {
      'application/json': {
        example: {
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          type: 'income',
          value: 1500,
          category: 'salary',
          userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Ошибка валидации: Нет типа операции / Нет значения операции / Нет категории операции',
    content: {
      'application/json': {
        example: {
          errors: [
            {
              status: 400,
              message: 'Нет типа операции',
            },
            {
              status: 400,
              message: 'Нет значения операции',
            },
            {
              status: 400,
              message: 'Нет категории операции',
            },
          ],
          status: 400,
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Ошибка при создании операции' })
  @Post()
  public async create(
    @Body() createIncomExpenceDto: CreateIncomeExpencesDto,
    @Query('userId') userId: string,
  ) {
    return this.incomeExpencesService.create(createIncomExpenceDto, userId);
  }

  @ApiOperation({ summary: 'Получить операции доходов/расходов' })
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя',
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
    required: false,
  })
  @ApiParam({
    name: 'id',
    description: 'ID операции',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
  })
  @ApiOkResponse({
    schema: {
      oneOf: [
        {
          type: 'array',
          description:
            'Список операций (при запросе по userId или без параметров)',
          example: [
            {
              id: '0512ca14-fc0a-40b1-8256-0c4ab500a150',
              category: 'Маникюр',
              type: 'expense',
              value: 3700,
              createDate: '2025-02-03T00:08:59.305Z',
              updateDate: null,
              userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
            },
            {
              id: '87a252cd-bcc3-4f09-a8e7-d83f7bd30324',
              category: 'Маникюр',
              type: 'expense',
              value: 3700,
              createDate: '2025-02-03T00:09:00.840Z',
              updateDate: null,
              userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
            },
          ],
        },
        {
          description: 'Одна операция (при запросе по id)',
          example: {
            id: '0512ca14-fc0a-40b1-8256-0c4ab500a150',
            category: 'Маникюр',
            type: 'expense',
            value: 3700,
            createDate: '2025-02-03T00:08:59.305Z',
            updateDate: null,
            userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Операции или пользователь не найдены / Категория не найдена',
  })
  @ApiResponse({
    status: 500,
    description:
      'Ошибка при поиске категорий по пользователю / Ошибка при поиске всех операций / Ошибка при поиске операции',
  })
  @Get()
  public async findAll(
    @Query('userId') userId: string,
    @Query('id') id: string,
  ) {
    if (userId) {
      return this.incomeExpencesService.findByUser(userId);
    } else if (id) {
      return this.incomeExpencesService.findOne(id);
    } else return this.incomeExpencesService.findAll();
  }

  @Put()
  public async update(
    @Query('id') id: string,
    @Body() updateIncomExpenceDto: UpdateIncomeExpences,
  ) {
    return this.incomeExpencesService.update(id, updateIncomExpenceDto);
  }

  @Delete()
  public async remove(@Query('id') id: string) {
    return this.incomeExpencesService.remove(id);
  }
}
