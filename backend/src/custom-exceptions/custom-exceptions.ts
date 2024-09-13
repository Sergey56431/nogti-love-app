import {NotFoundException, HttpStatus, UnauthorizedException, BadRequestException} from '@nestjs/common'; // Или аналогичный импорт для вашего фреймворка

export class CalendarNotFoundException extends NotFoundException {
    constructor(message?: string) {
        super(message || 'Календарь не найден'); // Используйте конструктор родительского класса
    }
}

export class ArchiveNotFoundException extends NotFoundException {
    constructor(message?: string) {
        super(message || 'Архивный календарь не найден'); // Используйте конструктор родительского класса
    }
}

export class UserNotFoundException extends UnauthorizedException {
    constructor(message?: string) {
        super(message || 'Пользователь не найден'); // Используйте конструктор родительского класса
    }
}

export class TokenException extends UnauthorizedException {
    constructor(message?: string) {
        super(message || 'Неверный или истекщий токен');
    }
}

export class UserAlreadyException extends BadRequestException {
    constructor(message?: string) {
        super(message || 'Пользователь с таким именем уже существует');
    }
}
