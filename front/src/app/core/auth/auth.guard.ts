import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLoggedIn = this.authService.getIsLoggedIn();
    if (!isLoggedIn){
      this.router.navigate(['/login']);
      this._snackBar.open('Для доступа необходимо авторизоваться');
    }

    return isLoggedIn;
  }

}
