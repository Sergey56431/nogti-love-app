import { Injectable } from '@angular/core';
import {CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthForvardGuard implements CanActivate {

  constructor(private authService: AuthService, private location: Location) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.getIsLoggedIn()) {
      this.location.back();
      return false;
    }
    return true;
  }
}
