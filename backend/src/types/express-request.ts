import { Request } from 'express';
import { UserCreateDto } from '../users/users-dto/user-dto';

export interface ExpressRequestInterface extends Request {
  user?: UserCreateDto;
}
