import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLoggedIn = this.authService.getIsLoggedIn();
    if (!isLoggedIn){
      console.log(isLoggedIn)
      this.router.navigate(['/login']);
      this._snackBar.open('Для доступа необходимо авторизоваться');
    }

    console.log(isLoggedIn)
    return isLoggedIn;
  }

}
