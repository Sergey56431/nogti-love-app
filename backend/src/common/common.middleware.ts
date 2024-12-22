import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ExpressRequestInterface } from '../types/express-request';

@Injectable()
export class CommonMiddleware implements NestMiddleware {
  use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers['x-auth-token']) {
      req.user = null;
      console.log('not-authorized');
      next();
      return HttpStatus.UNAUTHORIZED;
    }

    // логика проведения запросов для авторизованных пользователей
    console.log(req.user);
    next();
  }
}
