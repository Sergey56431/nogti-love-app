export interface LoginResponseType {
  username: string,
  password: string,
  id: string,
  error?: boolean,
  accessToken?: string,
  message?: string
}
