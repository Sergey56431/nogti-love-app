export interface RefreshResponseType {
    error: boolean,
    accessToken?: string,
    refreshToken?: string,
    message: string,
}