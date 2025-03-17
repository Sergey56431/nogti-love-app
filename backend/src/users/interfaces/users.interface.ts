import { TUserUpdateDto, UserCreateDto } from '../users-dto';

export interface IUsersService {
  findAll();
  findUniqUser(phoneNumber: string);
  findUserToRefresh(id: string);
  findOne(id: string);
  findFiltred(filter: any);
  createUser(dto: UserCreateDto);
  updateUser(id: string, data: TUserUpdateDto);
  deleteUser(id: string);
}
