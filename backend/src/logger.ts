import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export class CustomLogger implements LoggerService {
    private logger: winston.Logger;

    constructor(context?: string) {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message, context }) => {
                    return `${timestamp} [${level.toUpperCase()}]${context ? ' [' + context + ']' : ''}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, context }) => {
                            return `${timestamp} [${level.toUpperCase()}]${context ? ' [' + context + ']' : ''}: ${message}`;
                        })
                    ),
                }),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ],
        });
    }

    log(message: string, context?: string) {
        this.logger.info({ message, context });
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error({ message, trace, context });
    }

    warn(message: string, context?: string) {
        this.logger.warn({ message, context });
    }

    debug(message: string, context?: string) {
        this.logger.debug({ message, context });
    }

    verbose(message: string, context?: string) {
        this.logger.verbose({ message, context });
    }
}
