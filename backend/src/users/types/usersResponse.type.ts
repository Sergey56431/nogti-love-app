import {UserEntity} from "../users.entity";

export type UserResponseType = Omit<UserEntity, 'password'> & {token: string}
