import {ApiParam, ApiParamOptions, ApiResponse} from "@nestjs/swagger";

export function ApiResponseFindCalendarOrArchiveCelendarById(options?: object): MethodDecorator {
    return ApiResponse(options || {
        status:200,
        example:[{
            _id: "66e1ef6a86a281d9dccd70b9",
            day: "2024-09-01T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        },
        {
            _id: "66e1ef6a86a281d9dccd70bb",
            day: "2024-09-02T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        },
        {
            _id: "66e1ef6a86a281d9dccd70bd",
            day: "2024-09-03T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        }]
    });
}

export function ApiResponseUpdateCelendarById(options?: object): MethodDecorator {
    return ApiResponse(options || {
        status:200,
        example:{
            _id: "66e1ef6a86a281d9dccd70b9",
            day: "2024-09-01T18:00:00.000Z",
            state: "Не рабочий день",
            userId: "66e046c4254d306c823155f2"
        }
    });
}

export function ApiResponseCreateCelendar(options?: object): MethodDecorator {
    return ApiResponse(options || {
        status:201,
        example:[{
            _id: "66e1ef6a86a281d9dccd70b9",
            day: "2024-09-01T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        },
        {
            _id: "66e1ef6a86a281d9dccd70bb",
            day: "2024-09-02T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        },
        {
            _id: "66e1ef6a86a281d9dccd70bd",
            day: "2024-09-03T18:00:00.000Z",
            state: "Рабочий день",
            userId: "66e046c4254d306c823155f2"
        }]
    });
}

export function ApiResponseDeleteCalendarOrArchiveCalendar(options?: object): MethodDecorator {
    return ApiResponse(options || {
        status:200,
        example: {
            acknowledged: true,
            deletedCount: 90
        }
    });
}

export function ApiParamUserId(options?: ApiParamOptions): MethodDecorator {
    return ApiParam(options || {
        description: 'ID пользователя',
        name: 'id',
        example: '66c23742a5e4374202602bf9'
    });
}



