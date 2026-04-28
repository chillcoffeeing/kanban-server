import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@/generated/prisma/client';
import { UsersService } from '@modules/users/services/users.service';
import { PasswordHasherService } from './password-hasher.service';
import { TokenService } from './token.service';
import { MembersService } from '@modules/members/services/members.service';
import { InvitationsService } from '@modules/invitations/services/invitations.service';
import type { AuthTokens } from '../interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasherService,
    private readonly tokens: TokenService,
    private readonly members: MembersService,
    private readonly invitations: InvitationsService,
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
    
    const pending = await this.invitations.getPendingForUser(input.email);
    for (const inv of pending) {
      await this.invitations.acceptByTokenOnly(inv.token, user.id);
    }

    const tokens = await this.tokens.issueTokens({
      sub: user.id,
      email: user.email,
      name: user.name,
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
      name: user.name,
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
      name: user.name,
      roles: user.roles,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.tokens.verifyRefresh(refreshToken);
    await this.tokens.revoke(payload.jti);
  }
}
