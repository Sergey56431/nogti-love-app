import {ApiResponse} from "@nestjs/swagger";

export function FindCalendarOrArchiveCelendarByIdApiResponse(options?: object): MethodDecorator {
    return ApiResponse(options || {status:200, example:[{
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

export function UpdateCelendarByIdApiResponse(options?: object): MethodDecorator {
    return ApiResponse(options || {status:200, example:{
            _id: "66e1ef6a86a281d9dccd70b9",
            day: "2024-09-01T18:00:00.000Z",
            state: "Не рабочий день",
            userId: "66e046c4254d306c823155f2"
        }
    });
}

export function CreateCelendarApiResponse(options?: object): MethodDecorator {
    return ApiResponse(options || {status:201, example:[{
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

export function DeleteCalendarOrArchiveCalendarApiResponse(options?: object): MethodDecorator {
    return ApiResponse(options || {status:200, example:{
            acknowledged: true,
            deletedCount: 90
        }
    });
}
