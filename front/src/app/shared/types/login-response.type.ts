export interface LoginResponseType {
  username: string,
  password: string,
  id: string,
  error?: boolean,
  accessToken?: string,
  ref?: string,
  message?: string
}
