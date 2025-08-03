// noinspection JSUnusedGlobalSymbols

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

// eslint-disable-next-line func-style
export function apiUrlInterceptor(apiBase: string): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        if (req.url.startsWith(apiBase) || req.url.startsWith("http")) {
            return next(req);
        }

        const apiReq = req.clone({ url: `${apiBase}/${req.url}` });

        return next(apiReq);
    };
}
