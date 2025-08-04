/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

import { computed, inject } from "@angular/core";
import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState
} from "@ngrx/signals";
import { withStorageSync } from "@angular-architects/ngrx-toolkit";
import { catchError, EMPTY, firstValueFrom, Observable, tap } from "rxjs";
import { Router } from "@angular/router";
import { AccessToken, RefreshToken } from "../types";
import {
    AuthResponse,
    SuccessResponse,
    TokenResponse,
    User
} from "../interfaces";
import { AuthService } from "../services";
import { LoginDto } from "../interfaces/dtos/login.dto";

export interface AuthStateModel {
    loggedIn: boolean;
    user: User | null;
    accessToken: AccessToken | null;
    refreshToken: RefreshToken | null;
    accessTokenExpiresOn: Date | null;
    refreshTokenExpiresOn: Date | null;
}

const initialState: AuthStateModel = {
    loggedIn: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresOn: null,
    refreshTokenExpiresOn: null,
};

export const AuthState = signalStore(
    { providedIn: "root" },
    withState<AuthStateModel>(initialState),
    withStorageSync({ key: "auth" }),
    withComputed(({ accessToken, user }) => ({
        userId: computed(() => user()?.id),
        hasAccessToken: computed(() => Boolean(accessToken())),
        emailVerified: computed((): boolean => Boolean(user()?.emailVerified)),
    })),
    withMethods((state, router = inject(Router), authService = inject(AuthService)) => ({
        reset(): void {
            patchState(state, initialState);
        },
        setTokens(tokenResponse: TokenResponse): void {
            const {
                accessToken,
                refreshToken,
                accessTokenExpiresOn,
                refreshTokenExpiresOn
            } = tokenResponse;
            patchState(state, data => ({
                ...data,
                accessToken,
                refreshToken,
                accessTokenExpiresOn,
                refreshTokenExpiresOn,
            }));
        },
        login: <AsPromise extends boolean = false>(
            dto: LoginDto,
            redirect?: string | ((res: AuthResponse) => string),
            asPromise?: AsPromise,
        ): AsPromise extends true ? Promise<AuthResponse> : Observable<AuthResponse> => {
            const sub = authService.login(dto).pipe(
                tap((res: AuthResponse): void => {
                    patchState(state, { ...res, loggedIn: true });
                    if (redirect) {
                        void router.navigateByUrl(typeof redirect === "string" ? redirect : redirect(res));
                    }
                }),
            );

            if (asPromise) {
                return firstValueFrom(sub) as AsPromise extends true ? Promise<AuthResponse> : Observable<AuthResponse>
            }

            return sub as AsPromise extends true ? Promise<AuthResponse> : Observable<AuthResponse>;
        },
        logout: <AsPromise extends boolean = false>(
            redirect?: string,
            asPromise?: AsPromise,
        ): AsPromise extends true ? Promise<SuccessResponse | null> : Observable<SuccessResponse | null> => {
            const sub = authService.logout().pipe(
                tap({
                    next: (): void => {
                        patchState(state, initialState);
                        if (redirect) {
                            void router.navigateByUrl(redirect);
                        }
                    },
                }),
                catchError(() => EMPTY),
            );

            if (asPromise) {
                return firstValueFrom(sub) as AsPromise extends true ? Promise<SuccessResponse | null> : Observable<SuccessResponse | null>;
            }

            return sub as AsPromise extends true ? Promise<SuccessResponse | null> : Observable<SuccessResponse | null>;
        },
    })),
);
