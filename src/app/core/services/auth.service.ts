// noinspection JSUnusedGlobalSymbols

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, take } from "rxjs";
import { SignInDto } from "../interfaces/dtos/sign-in.dto";
import { RefreshToken } from "../types";
import { AuthResponse, SuccessResponse, TokenResponse, User } from "../interfaces";
import { AuthEndpoint, Endpoint } from "../enums";
import { CreateUserDto } from "../interfaces/dtos";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    constructor(private readonly http: HttpClient) {}

    signIn(dto: SignInDto): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${Endpoint.AUTH}/${AuthEndpoint.SIGN_IN}`, dto).pipe(
            take(1),
            map(res => ({
                ...res,
                accessTokenExpiresOn: new Date(res.accessTokenExpiresOn),
                refreshTokenExpiresOn: new Date(res.refreshTokenExpiresOn),
            })),
        );
    }

    signUp(dto: CreateUserDto): Observable<User> {
        return this.http.post<User>(`${Endpoint.AUTH}/${AuthEndpoint.SIGN_UP}`, dto).pipe(take(1));
    }

    refreshToken(refreshToken: RefreshToken): Observable<TokenResponse> {
        return this.http
            .post<AuthResponse>(`${Endpoint.AUTH}/${AuthEndpoint.REFRESH}`, {
                refreshToken,
            })
            .pipe(take(1));
    }

    signOut(): Observable<SuccessResponse | null> {
        return this.http.post<SuccessResponse>(`${Endpoint.AUTH}/${AuthEndpoint.SIGN_OUT}`, {}).pipe(take(1));
    }
}
