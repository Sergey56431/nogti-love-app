import {Component} from '@angular/core';
import {ActivatedRouteSnapshot, RouterLink, RouterOutlet} from '@angular/router';
import {routes} from './app.routes';
import {AppStoreModule} from '@core/store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppStoreModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Nails-room';
  protected readonly routes = routes;
  protected readonly ActivatedRouteSnapshot = ActivatedRouteSnapshot;
}
