export interface LoginResponseType {
  username: string,
  password: string,
  error?: boolean,
  accessToken?: string,
  ref?: string,
  message?: string
}
