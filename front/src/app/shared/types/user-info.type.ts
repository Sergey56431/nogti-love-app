export interface UserInfoType {
  userId?: string,
  name?: string,
  username?: string,
  rate?: number,
  lastName?: string,
  password?: string
  phoneNumber?: string,
  refreshToken?: string;
  role?: string,
}

// export interface AdminInfoType extends UserInfoType {
//
// }

export interface ClientInfoType extends UserInfoType {
  image?: string,
  id?: string;
  score?: number
  lastVisit?: string;
  description?: string,
  comment?: string;
  birthday?: Date;
  masterId?: string;
  roleId?: string;
}
