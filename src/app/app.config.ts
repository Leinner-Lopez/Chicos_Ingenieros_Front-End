import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, TransferState } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Core/Interceptors/auth-interceptor';
import { loggingInterceptor } from './Core/Interceptors/logging.interceptor';
import { GlobalErrorHandler } from './Core/Interceptors/global-error-handler';
import { API_URL, API_URL_STATE_KEY } from './tokens/api-url.token';
import { provideI18n } from './i18n/i18n.providers';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loggingInterceptor])),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    ...provideI18n(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: API_URL,
      useFactory: (ts: TransferState) => ts.get(API_URL_STATE_KEY, environment.apiUrl),
      deps: [TransferState],
    },
  ],
};
