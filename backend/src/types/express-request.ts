import { Request } from 'express';
import { UserDto } from '../users/users-dto/user-dto';

export interface ExpressRequestInterface extends Request {
  user?: UserDto;
}
