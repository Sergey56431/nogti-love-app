import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {Observable, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {LoginResponseType} from "../../../types/login-response.type";
import {SignupResponseType} from "../../../types/signup-response.type";
import {UserInfoType} from "../../../types/user-info.type";
import {RefreshResponseType} from "../../../types/refresh-response.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  private userInfoKey: string = 'userInfo';

  public isLogged: boolean = false;
  public isLogged$: Subject<boolean> = new Subject<boolean>()

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.isLogged = !!this.cookieService.get(this.accessTokenKey);
  }

  login(username:string, password: string): Observable<LoginResponseType> {
    return this.http.post<LoginResponseType>(environment.api + 'login', {
      username,
      password
    })
      .pipe(
        tap((data: LoginResponseType) => {
          if (data.username && data.accessToken) {
            this.setUserInfo({
              name: data.username
            })
            this.setTokens(data.accessToken);
          }
        })
      )
  }

  signup(email: string, password: string, phone: string, username: string, birth_date: string): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.api + 'register', {
      username, password, phone, email, birth_date
    })
  }

  logout(): Observable<DefaultResponseType> {
    return this.http.get<DefaultResponseType>(environment.api + 'logout')
  }

  // refresh(): Observable<RefreshResponseType> {
  //   const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
  //   return this.http.post<RefreshResponseType>(environment.api + 'refresh', {
  //     refreshToken
  //   })
  // }

  public getIsLoggedIn() {
    return this.isLogged;
  }

  public setTokens(accessToken: string) {
    this.cookieService.set(this.accessTokenKey, accessToken);
    // this.cookieService.set(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true)
  }

  public removeTokens() {
    this.cookieService.delete(this.accessTokenKey);
    // this.cookieService.delete(this.refreshTokenKey);
    this.isLogged = true;
    this.isLogged$.next(true)
  }

  public removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey)
  }

  public getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    return null;
  }

  public setUserInfo(info: {}) {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info))
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null }{
    return {
      accessToken: this.cookieService.get(this.accessTokenKey),
      refreshToken: this.cookieService.get(this.refreshTokenKey)
    }
  }
}
