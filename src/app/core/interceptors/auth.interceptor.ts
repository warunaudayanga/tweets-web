import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { catchError, filter, Observable, ReplaySubject, switchMap, take, throwError } from "rxjs";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthState } from "../state";
import { AuthService } from "../services";
import { AuthEndpoint, Endpoint } from "../enums";
import { AccessToken } from "../types";
import { TokenResponse } from "../interfaces";

// export const SKIPPED_ERRORS = ["AUTH_401_EXPIRED_TOKEN", "AUTH_401_INVALID_TOKEN", "AUTH_401_NOT_LOGGED_IN"];

let refreshingInProgress = false;

const isRefreshTokenReq = (req: HttpRequest<unknown>): boolean =>
    req.url.includes(`${Endpoint.AUTH}/${AuthEndpoint.REFRESH}`);

let tokenSubject: ReplaySubject<AccessToken | null> = new ReplaySubject<AccessToken | null>(1);

// eslint-disable-next-line func-style
export function authInterceptor(redirect: string, onRedirect?: () => void): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const authState = inject(AuthState);
        const authService = inject(AuthService);
        const router = inject(Router);

        const setAccessToken = (req: HttpRequest<unknown>, accessToken: AccessToken): HttpRequest<unknown> => {
            return req.clone({
                headers: req.headers.set("Authorization", `Bearer ${accessToken}`),
            });
        };

        const gotoSignIn = (): void => {
            onRedirect?.();
            authState.reset();
            // eslint-disable-next-line no-void
            void router.navigateByUrl(redirect);
        };

        const refreshToken = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
            if (!refreshingInProgress) {
                refreshingInProgress = true;
                tokenSubject.next(null);

                const refreshToken = authState.refreshToken();

                if (!refreshToken) {
                    refreshingInProgress = false;
                    gotoSignIn();
                    return throwError(() => new Error("Refresh token not found."));
                }

                return authService.refreshToken(refreshToken).pipe(
                    switchMap((tokenResponse: TokenResponse) => {
                        authState.setTokens(tokenResponse);
                        tokenSubject.next(tokenResponse.accessToken);
                        tokenSubject.complete();
                        tokenSubject = new ReplaySubject<AccessToken | null>(1);
                        refreshingInProgress = false;
                        return next(setAccessToken(req, tokenResponse.accessToken));
                    }),
                    catchError((error: unknown) => {
                        refreshingInProgress = false;
                        tokenSubject.error(error);
                        tokenSubject.complete();
                        tokenSubject = new ReplaySubject<AccessToken | null>(1);
                        gotoSignIn();
                        return throwError(() => error);
                    }),
                );
            }

            return tokenSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(token => {
                    return next(setAccessToken(req, token));
                }),
            );
        };

        const handleRequest = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
            return next(req).pipe(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                catchError((error: any) => {
                    if (error.status === 401 && !isRefreshTokenReq(req)) {
                        if (authState.loggedIn()) {
                            return refreshToken(req, next);
                        }
                    }
                    return throwError(() => error);
                }),
            );
        };

        if (authState.accessToken()) {
            const tokenizedRequest = req.clone({
                headers: req.headers.set("Authorization", `Bearer ${authState.accessToken()}`),
            });
            return handleRequest(tokenizedRequest, next);
        }
        return handleRequest(req, next);
    };
}
