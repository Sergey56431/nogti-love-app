import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export class CustomLogger implements LoggerService {
    private readonly _logger: winston.Logger;

    constructor() {
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message, context }) => {
                    return `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
                }),
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    level: 'info',
                    maxsize: 20 * 1024 * 1024, // 20MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 20 * 1024 * 1024, // 20MB
                    maxFiles: 10,
                }),
            ],
        });
    }

    log(message: string, context?: string) {
        this._logger.info({ message, context });
    }

    error(message: string, trace?: string, context?: string) {
        this._logger.error({ message, trace, context });
    }

    warn(message: string, context?: string) {
        this._logger.warn({ message, context });
    }

    debug?(message: string, context?: string) {
        this._logger.debug({ message, context });
    }

    verbose?(message: string, context?: string) {
        this._logger.verbose({ message, context });
    }
}