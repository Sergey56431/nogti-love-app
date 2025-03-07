import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './auth.service';
import { MessageService } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              private router: Router,
              private _snackBar: MessageService) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLoggedIn = this.authService.getIsLoggedIn();
    if (!isLoggedIn){
      this.router.navigate(['/login']);
      const status = SnackStatusesUtil.getStatuses('error', 'Для доступа необходимо авторизоваться');
      this._snackBar.add(status);
    }
    return isLoggedIn;
  }

}
