import { Request } from 'express';
import { UserCreateDto } from '../users';

export interface ExpressRequestInterface extends Request {
  user?: UserCreateDto;
}
