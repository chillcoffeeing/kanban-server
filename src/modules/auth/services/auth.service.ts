import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersService } from '@modules/users/services/users.service';
import { PasswordHasherService } from './password-hasher.service';
import { TokenService } from './token.service';
import type { AuthTokens } from '../interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasherService,
    private readonly tokens: TokenService,
  ) {}

  async register(input: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
    const tokens = await this.tokens.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { user, tokens };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.hasher.verify(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.users.touchLastLogin(user.id);
    const tokens = await this.tokens.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.tokens.verifyRefresh(refreshToken);
    await this.tokens.revoke(payload.jti);

    const user = await this.users.getById(payload.sub);
    return this.tokens.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.tokens.verifyRefresh(refreshToken);
    await this.tokens.revoke(payload.jti);
  }
}
