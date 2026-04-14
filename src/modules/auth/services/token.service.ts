import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { TypedConfigService } from '@config/typed-config.service';
import type {
  AccessTokenPayload,
  AuthTokens,
  RefreshTokenPayload,
} from '../interfaces/token-payload.interface';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../interfaces/refresh-token-repository.interface';
import { parseDurationToMs } from '@shared/duration.util';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: TypedConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshRepo: IRefreshTokenRepository,
  ) {}

  async issueTokens(payload: AccessTokenPayload): Promise<AuthTokens> {
    const accessTtl = this.config.get('JWT_ACCESS_TTL');
    const refreshTtl = this.config.get('JWT_REFRESH_TTL');

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: accessTtl,
    });

    const jti = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: payload.sub, jti };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshTtl,
    });

    await this.refreshRepo.create({
      id: jti,
      userId: payload.sub,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + parseDurationToMs(refreshTtl)),
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: accessTtl,
      refreshTokenExpiresIn: refreshTtl,
    };
  }

  async verifyRefresh(token: string): Promise<RefreshTokenPayload> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshRepo.findById(payload.jti);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }
    if (stored.tokenHash !== this.hashToken(token)) {
      throw new UnauthorizedException('Refresh token mismatch');
    }
    return payload;
  }

  revoke(jti: string): Promise<void> {
    return this.refreshRepo.revoke(jti);
  }

  revokeAll(userId: string): Promise<void> {
    return this.refreshRepo.revokeAllForUser(userId);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
