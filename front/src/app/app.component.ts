import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStoreModule } from '@core/store';
import { PrimeNG } from 'primeng/config';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppStoreModule, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Ногти.Love';

  constructor(private primeng: PrimeNG) {}

  ngOnInit() {
    this.primeng.ripple.set(true);
  }
}
