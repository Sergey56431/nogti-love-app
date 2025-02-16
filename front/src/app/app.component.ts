import { Component, OnInit } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { routes } from './app.routes';
import { AppStoreModule } from '@core/store';
import { PrimeNG } from 'primeng/config';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppStoreModule, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Ногти.Love';
  protected readonly routes = routes;
  protected readonly ActivatedRouteSnapshot = ActivatedRouteSnapshot;

  constructor(private primeng: PrimeNG) {}

  ngOnInit() {
    this.primeng.ripple.set(true);
  }
}
