import { mergeApplicationConfig, ApplicationConfig, TransferState } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { LoggerService } from './Core/Services/logger.service';
import { API_URL, API_URL_STATE_KEY } from './tokens/api-url.token';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    LoggerService,
    {
      provide: API_URL,
      useFactory: (ts: TransferState) => {
        const url = process.env['API_URL'] || environment.apiUrl;
        ts.set(API_URL_STATE_KEY, url);
        return url;
      },
      deps: [TransferState],
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
