import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./core/interceptors";
import { apiUrlInterceptor } from "./core/interceptors/api-url-interceptor";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([apiUrlInterceptor(environment.apiUrl), authInterceptor("/")])),
    ],
};
