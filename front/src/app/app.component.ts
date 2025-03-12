import { Component, OnInit } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterOutlet,
} from '@angular/router';
import { routes } from './app.routes';
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
  protected readonly routes = routes;
  protected readonly ActivatedRouteSnapshot = ActivatedRouteSnapshot;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  private installPromptEvent;

  constructor(private primeng: PrimeNG) {
    this.checkIfInstalled();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./ngsw-work er.json').then(registration => {
          console.log('Service Worker зарегистрирован:', registration);
        }).catch(error => {
          console.error('Ошибка регистрации Service Worker:', error);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      // Предотвращаем отображение стандартного диалогового окна
      event.preventDefault();
      this.installPromptEvent = event;
      this.showInstallPrompt();
    });
  }

  checkIfInstalled() {
    // Проверка, если приложение открыто в режиме PWA
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return;
    }
  }

  showInstallPrompt() {
    // Используем confirm для предложения установки
    const userConfirmed = confirm('Хотите установить это приложение на свое устройство?');

    if (userConfirmed && this.installPromptEvent) {
      this.installPromptEvent.prompt();
      this.installPromptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь принял установку приложения');
        } else {
          console.log('Пользователь отклонил установку приложения');
        }
      });
    }
  }

  ngOnInit() {
    this.primeng.ripple.set(true);
  }
}
