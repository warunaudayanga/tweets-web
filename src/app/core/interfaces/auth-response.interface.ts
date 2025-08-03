import { AccessToken, RefreshToken } from "../types";
import { User } from "./user.interface";

export interface Tokens {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}

export interface TokenResponse extends Tokens {
    accessTokenExpiresOn: Date;
    refreshTokenExpiresOn: Date;
}

export interface AuthResponse extends TokenResponse {
    user: User;
}
