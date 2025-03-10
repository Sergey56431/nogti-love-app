import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { DayState } from '@prisma/client';

export function CustomSwaggerUpdateCalendarResponse(
  options?: ApiResponseOptions,
): MethodDecorator {
  return ApiOkResponse(
    options || {
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
          },
          date: { type: 'string', format: 'date-time' },
          state: { type: 'string', enum: Object.values(DayState) },
          userId: {
            type: 'string',
            example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
          },
          directs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
                },
                phone: { type: 'string', example: '89502151980' },
                clientName: { type: 'string', example: 'Влад' },
                time: { type: 'string', example: '15:00' },
                comment: { type: 'string', example: 'Поярче ногти' },
                userId: {
                  type: 'string',
                  example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
                },
                state: {
                  type: 'string',
                  enum: ['notConfirmed', 'confirmed', 'cancelled'],
                }, // Enum для DirectsState
                services: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      service: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
                          },
                          name: { type: 'string', example: 'Без покрытия' },
                          time: { type: 'string', example: '2:00' },
                          price: { type: 'number', example: 2000 },
                          categoryId: {
                            type: 'string',
                            example: 'efb59de3-6a4d-4b8e-bab2-85a012535cb8',
                          },
                          category: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'Маникюр' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      description: 'День календаря успешно обновлен',
    },
  );
}

export function CustomSwaggerCreateCalendarResponses(
  options?: ApiResponseOptions,
): MethodDecorator {
  return ApiCreatedResponse(
    options || {
      description: 'Календарь успешно создан',
      content: {
        'application/json': {
          example: [
            {
              id: '8bc88f1f-984f-4f11-93ed-c5587bf3b828',
              date: '2025-05-01T00:00:00.000Z',
              time: '09:00-16:00',
              state: 'empty',
              userId: 'ea6580aa-020f-4f07-aeab-9d801e5da629',
              freeSlots: [
                {
                  time: '09:00',
                },
                {
                  time: '09:30',
                },
                {
                  time: '10:00',
                },
                {
                  time: '10:30',
                },
                {
                  time: '11:00',
                },
                {
                  time: '11:30',
                },
                {
                  time: '12:00',
                },
                {
                  time: '12:30',
                },
                {
                  time: '13:00',
                },
                {
                  time: '13:30',
                },
                {
                  time: '14:00',
                },
                {
                  time: '14:30',
                },
                {
                  time: '15:00',
                },
                {
                  time: '15:30',
                },
                {
                  time: '16:00',
                },
              ],
            },
            {
              id: '2c4e0cfa-3ac5-42f3-b10a-253a90ab3dfb',
              date: '2025-05-02T00:00:00.000Z',
              time: '09:00-16:00',
              state: 'empty',
              userId: 'ea6580aa-020f-4f07-aeab-9d801e5da629',
              freeSlots: [
                {
                  time: '09:00',
                },
                {
                  time: '09:30',
                },
                {
                  time: '10:00',
                },
                {
                  time: '10:30',
                },
                {
                  time: '11:00',
                },
                {
                  time: '11:30',
                },
                {
                  time: '12:00',
                },
                {
                  time: '12:30',
                },
                {
                  time: '13:00',
                },
                {
                  time: '13:30',
                },
                {
                  time: '14:00',
                },
                {
                  time: '14:30',
                },
                {
                  time: '15:00',
                },
                {
                  time: '15:30',
                },
                {
                  time: '16:00',
                },
              ],
            },
            {
              id: 'eedfd8a4-8f37-4cb8-a875-bab958bb33e9',
              date: '2025-05-03T00:00:00.000Z',
              time: '09:00-16:00',
              state: 'empty',
              userId: 'ea6580aa-020f-4f07-aeab-9d801e5da629',
              freeSlots: [
                {
                  time: '09:00',
                },
                {
                  time: '09:30',
                },
                {
                  time: '10:00',
                },
                {
                  time: '10:30',
                },
                {
                  time: '11:00',
                },
                {
                  time: '11:30',
                },
                {
                  time: '12:00',
                },
                {
                  time: '12:30',
                },
                {
                  time: '13:00',
                },
                {
                  time: '13:30',
                },
                {
                  time: '14:00',
                },
                {
                  time: '14:30',
                },
                {
                  time: '15:00',
                },
                {
                  time: '15:30',
                },
                {
                  time: '16:00',
                },
              ],
            },
          ],
        },
      },
    },
  );
}

export function CustomSwaggerGetCalendarResponses(
  options?: ApiResponseOptions,
): MethodDecorator {
  return ApiOkResponse(
    options || {
      schema: {
        oneOf: [
          {
            type: 'array',
            description: 'Ответ при запросе по userId',
            example: [
              {
                id: '3f514899-0851-4885-aba9-30791a7d5573',
                date: '2025-02-05T00:00:00.000Z',
                state: 'notHave',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
                date: '2025-02-06T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [
                  {
                    id: 'b247fcea-c548-4ea8-90e9-db1a73066ee3',
                    phone: '89502151980',
                    clientName: 'Владrr',
                    time: '17:55',
                    comment: 'Коментарий',
                    userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                    state: 'confirmed',
                    calendarId: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
                  },
                ],
              },
            ],
          },
          {
            description: 'Ответ при запросе по id',
            example: {
              id: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
              date: '2025-02-06T00:00:00.000Z',
              state: 'empty',
              userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
              directs: [
                {
                  id: 'b247fcea-c548-4ea8-90e9-db1a73066ee3',
                  phone: '89502151980',
                  clientName: 'Владrr',
                  time: '17:55',
                  comment: 'Коментарий',
                  userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                  state: 'confirmed',
                  calendarId: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
                },
              ],
            },
          },
          {
            type: 'array',
            description: 'Ответ при запросе всех дней',
            example: [
              {
                id: '3f514899-0851-4885-aba9-30791a7d5573',
                date: '2025-02-05T00:00:00.000Z',
                state: 'notHave',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
                date: '2025-02-06T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [
                  {
                    id: 'b247fcea-c548-4ea8-90e9-db1a73066ee3',
                    phone: '89502151980',
                    clientName: 'Владrr',
                    time: '17:55',
                    comment: 'Коментарий',
                    userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                    state: 'confirmed',
                    calendarId: 'a0c794f7-bc4e-4060-8419-54b186b09bc9',
                  },
                ],
              },
              {
                id: '75bd2d38-856e-4d07-bba6-8d824c141aaf',
                date: '2025-02-07T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '9ff35398-5534-4c82-9022-82fb3d78427b',
                date: '2025-01-01T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '4675821a-241e-49bf-8cfb-13c2c8c8527a',
                date: '2025-01-02T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: 'd9380d04-62bf-4c0a-86da-0e510a6c482c',
                date: '2025-01-03T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: 'b4929c1e-d88a-4574-a857-6bbb854e428d',
                date: '2025-01-04T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '1814b279-e006-46f7-864a-fc3e67a6ecfc',
                date: '2025-01-05T00:00:00.000Z',
                state: 'notHave',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '33e504b4-ebd6-47bd-82ef-ded312f75eaf',
                date: '2025-01-06T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '704856c4-9252-4d17-9062-0f57e69a6151',
                date: '2025-01-07T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '6fbd1b1d-984e-4d43-b914-ee96254bde19',
                date: '2025-01-08T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: 'e1d73d4a-4509-4117-91c5-59cd0f0a60b0',
                date: '2025-01-09T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '38d121ae-364f-417b-9707-9e0c88061a44',
                date: '2025-01-10T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '280f59e9-f982-4256-802e-1f2733d9daf5',
                date: '2025-01-11T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
              {
                id: '4aef6f3f-59b2-4426-a387-386abc150df3',
                date: '2025-01-12T00:00:00.000Z',
                state: 'empty',
                userId: '5592c7c4-c398-435a-9b9e-bc550139e698',
                directs: [],
              },
            ],
          },
        ],
      },
    },
  );
}

export function CustomSwaggerUserIdParam(
  options?: ApiParamOptions,
): MethodDecorator {
  return ApiParam(
    options || {
      description: 'ID пользователя',
      name: 'id',
      example: '5592c7c4-c398-435a-9b9e-bc550139e698',
    },
  );
}
