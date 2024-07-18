import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isLogged: boolean = false;
  username = this.authService.getUserInfo()
  constructor(private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    })
  }

  logout(){{
    this.authService.logout()
      .subscribe({
        next: () => {
          ``
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }
  }

  doLogout() {
    this.authService.removeTokens();
    // this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this.router.navigate(['/']);
  }
}
