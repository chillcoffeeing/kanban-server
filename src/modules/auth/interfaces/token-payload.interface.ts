export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}
