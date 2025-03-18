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
import { CreateDirectDto, UpdateDirectDto } from './dto';
import { TokenGuard } from '../auth';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IDirectsService } from './interfaces';
import { DirectsService } from './directs.service';

@UseGuards(TokenGuard)
@ApiTags('Directs (Записи)')
@Controller('directs')
export class DirectsController {
  constructor(
    @Inject(DirectsService)
    private readonly _directsService: IDirectsService,
  ) {}

  @ApiOperation({ summary: 'Создать запись' })
  @ApiCreatedResponse({
    example: {
      id: 'd67dadbd-74a0-45d8-be37-a1ce31fadedf',
      phone: '89502151980',
      clientName: 'vlad',
      time: '16:15',
      comment: 'Коментарий',
      userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
      state: 'notConfirmed',
      calendarId: '014ef355-e080-4a87-b9df-55db81cf5a2c',
      services: [
        {
          service: {
            id: '9e4c5f34-87ce-4900-9497-4daad93a0b38',
            name: 'Без покрытия',
            time: '01:30',
            price: 800,
            categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
            category: {
              name: 'Маникюр',
            },
          },
        },
        {
          service: {
            id: 'bc24ea47-ddc4-4f9a-a28c-c438cfd354ba',
            name: 'С покрытием',
            time: '02:15',
            price: 1500,
            categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
            category: {
              name: 'Маникюр',
            },
          },
        },
      ],
    },
    description: 'Запись успешно создана',
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiNotFoundResponse({
    description:
      'Календарь для указанной даты не найден / Пользователь не найден / Услуга не найдена',
  })
  @ApiBody({ type: CreateDirectDto })
  @Post()
  public async create(@Body() createDirectDto: CreateDirectDto) {
    return await this._directsService.create(createDirectDto);
  }



  @ApiOperation({ summary: 'Получить записи' })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '20-02-2025',
    description: 'Дата для фильтрации',
  })
  @ApiQuery({
    name: 'userId',
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
    required: false,
    description: 'ID пользователя для фильтрации',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'ID записи',
    example: 'bd186557-9f78-4db9-ad53-10e14dd88526',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [
        {
          type: 'array',
          description:
            'Список записей (при запросе по date или userId или без параметров)',
          example: [
            {
              id: 'bd186557-9f78-4db9-ad53-10e14dd88526',
              phone: '89502151980',
              clientName: 'vlad',
              time: '16:15',
              comment: 'Коментарий',
              userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
              state: 'notConfirmed',
              calendarId: '014ef355-e080-4a87-b9df-55db81cf5a2c',
              services: [
                {
                  service: {
                    id: '9e4c5f34-87ce-4900-9497-4daad93a0b38',
                    name: 'Без покрытия',
                    time: '01:30',
                    price: 800,
                    categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
                    category: {
                      name: 'Маникюр',
                    },
                  },
                },
                {
                  service: {
                    id: 'bc24ea47-ddc4-4f9a-a28c-c438cfd354ba',
                    name: 'С покрытием',
                    time: '02:15',
                    price: 1500,
                    categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
                    category: {
                      name: 'Маникюр',
                    },
                  },
                },
              ],
            },
            {
              id: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
              phone: '89502151980',
              clientName: 'vlad',
              time: '16:15',
              comment: 'Коментарий',
              userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
              state: 'notConfirmed',
              calendarId: '014ef355-e080-4a87-b9df-55db81cf5a2c',
              services: [
                {
                  service: {
                    id: 'bc24ea47-ddc4-4f9a-a28c-c438cfd354ba',
                    name: 'С покрытием',
                    time: '02:15',
                    price: 1500,
                    categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
                    category: {
                      name: 'Маникюр',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
            phone: { type: 'string', nullable: true },
            clientName: { type: 'string', nullable: true },
            time: { type: 'string' },
            comment: { type: 'string', nullable: true },
            userId: { type: 'string', nullable: true },
            state: {
              type: 'string',
              enum: ['notConfirmed', 'confirmed', 'cancelled'],
            },
            calendarId: { type: 'string' },
            services: {
              type: 'array',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                time: { type: 'string' },
                price: { type: 'number' },
                categoryId: { type: 'string' },
                category: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          description: 'Одна запись (при запросе по id)',
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Запись не найдена' })
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

  @ApiOperation({ summary: 'Обновить запись' })
  @ApiQuery({
    name: 'id',
    description: 'ID записи для обновления',
    example: 'bd186557-9f78-4db9-ad53-10e14dd88526',
  })
  @ApiBody({ type: CreateDirectDto })
  @ApiOkResponse({
    example: {
      id: 'd67dadbd-74a0-45d8-be37-a1ce31fadedf',
      phone: '89502151980',
      clientName: 'vlad',
      time: '16:15',
      comment: 'Коментарий',
      userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
      state: 'notConfirmed',
      calendarId: '014ef355-e080-4a87-b9df-55db81cf5a2c',
      services: [
        {
          service: {
            id: '9e4c5f34-87ce-4900-9497-4daad93a0b38',
            name: 'Без покрытия',
            time: '01:30',
            price: 800,
            categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
            category: {
              name: 'Маникюр',
            },
          },
        },
        {
          service: {
            id: 'bc24ea47-ddc4-4f9a-a28c-c438cfd354ba',
            name: 'С покрытием',
            time: '02:15',
            price: 1500,
            categoryId: '06d9aea0-849a-4c1f-ac5e-2bd92a6ebb6d',
            category: {
              name: 'Маникюр',
            },
          },
        },
      ],
    },
    description: 'Запись успешно обновлена',
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiNotFoundResponse({
    description:
      'Запись не найдена / Календарь для указанной даты не найден / Пользователь не найден / Услуга не найдена',
  })
  @Put()
  public async update(
    @Query('id') id: string,
    @Body() updateDirectDto: UpdateDirectDto,
  ) {
    return await this._directsService.update(id, updateDirectDto);
  }

  @ApiOperation({ summary: 'Удалить запись' })
  @ApiQuery({
    name: 'id',
    description: 'ID записи для удаления',
    example: 'b355c3b7-3bec-476b-8e4e-c566e73334e4',
  })
  @ApiOkResponse({ description: 'Запись успешно удалена' })
  @ApiNotFoundResponse({ description: 'Запись не найдена' })
  @Delete()
  public async remove(@Query('id') id?: string) {
    return await this._directsService.remove(id);
  }
}
