import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideStore } from '@ngxs/store';
import {
  ErrorStateMatcher,
  provideNativeDateAdapter,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import { provideServiceWorker } from '@angular/service-worker';
import { AuthInterceptor } from '@core/auth';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MyPreset } from '@shared/utils';

export const appConfig: ApplicationConfig = {
  providers: [
    DialogService,
    MessageService,
    ConfirmDialog,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideNativeDateAdapter(),
    provideRouter(routes, withDebugTracing()),
    provideStore([]),
    provideAnimationsAsync(),
    providePrimeNG({
      translation: {
        dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда',
          'Четверг', 'Пятница', 'Суббота'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dayNamesShort: ['Вск', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Сбт'],
        weekHeader: 'Нед.',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
                          'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      },
      theme: {
        preset: MyPreset,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false,
        },
      },
    }),
    { provide: LOCALE_ID, useValue: 'ru' },
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },

    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500 },
    },
    provideCharts(withDefaultRegisterables()),
    provideStore([]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
