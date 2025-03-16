import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { OperationsService } from './incom_expences.service';
import { CreateOperationsDto, UpdateOperationsDto } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TypeOperation } from '@prisma/client';
import { IOperationsService } from './interfaces';

@UseGuards(TokenGuard)
@ApiTags('Operation (Операции)')
@Controller('operation')
export class IncomeExpencesController {
  constructor(
    @Inject(OperationsService)
    private readonly _operationsService: IOperationsService,
  ) {}

  @ApiOperation({ summary: 'Создать операцию дохода/расхода' })
  @ApiBody({
    type: CreateOperationsDto,
    description: 'Данные для создания операции',
  })
  @ApiCreatedResponse({
    description: 'Операция успешно создана',
    type: CreateOperationsDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Ошибка валидации: Нет типа операции / Нет значения операции / Нет категории операции',
  })
  @ApiResponse({ status: 500, description: 'Ошибка при создании операции' })
  @Post()
  public async create(@Body() createIncomExpenceDto: CreateOperationsDto) {
    return this._operationsService.create(createIncomExpenceDto);
  }

  @ApiOperation({ summary: 'Получить операции (опционально)' })
  @ApiQuery({
    name: 'userId',
    description: 'ID пользователя',
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
    required: false,
  })
  @ApiQuery({
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
          type: 'object',
          properties: {
            id: { type: 'string' },
            category: { type: 'string' },
            type: { type: 'string', enum: Object.values(TypeOperation) },
            value: { type: 'number' },
            createDate: { type: 'string', format: 'date-time' },
            updateDate: { type: 'string', format: 'date-time', nullable: true },
            userId: { type: 'string' },
          },
          description: 'Одна операция (при запросе по id)',
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
      return this._operationsService.findByUser(userId);
    } else if (id) {
      return this._operationsService.findOne(id);
    } else return this._operationsService.findAll();
  }

  @ApiOperation({ summary: 'Обновить операцию дохода/расхода' })
  @ApiQuery({
    name: 'id',
    description: 'ID операции',
    example: '3b17500f-307a-4454-a87e-5108a63fb2a6',
  })
  @ApiBody({
    type: CreateOperationsDto,
    description: 'Данные для обновления операции',
  })
  @ApiResponse({
    status: 200,
    description: 'Операция успешно обновлена',
    type: CreateOperationsDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Операция не найдена' })
  @ApiResponse({ status: 500, description: 'Ошибка при обновлении операции' })
  @Put()
  public async update(
    @Query('id') id: string, // Используем @Param для получения id из URL
    @Body() updateIncomExpenceDto: UpdateOperationsDto,
  ) {
    return this._operationsService.update(id, updateIncomExpenceDto);
  }

  @ApiOperation({ summary: 'Удалить операцию дохода/расхода' })
  @ApiQuery({
    name: 'id',
    description: 'ID операции',
    example: '3b17500f-307a-4454-a87e-5108a63fb2a6',
  })
  @ApiResponse({ status: 204, description: 'Операция успешно удалена' })
  @ApiResponse({ status: 404, description: 'Операция не найдена' })
  @ApiResponse({ status: 500, description: 'Ошибка при удалении операции' })
  @Delete()
  public async remove(@Query('id') id: string) {
    return this._operationsService.remove(id);
  }
}
