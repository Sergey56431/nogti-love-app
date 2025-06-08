import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideStore } from '@ngxs/store';
import { provideServiceWorker } from '@angular/service-worker';
import { AuthInterceptor } from '@core/auth';
import { providePrimeNG } from 'primeng/config';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Localization, MyPreset } from '@shared/utils';
import { CalendarState, OperationCategoriesState, OperationsState, SettingsState } from '@core/store';

export const appConfig: ApplicationConfig = {
  providers: [
    DialogService,
    MessageService,
    ConfirmDialog,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore([
      SettingsState,
      OperationCategoriesState,
      OperationsState,
      CalendarState]),
    provideAnimationsAsync(),
    providePrimeNG({
      translation: Localization,
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
    provideCharts(withDefaultRegisterables()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
