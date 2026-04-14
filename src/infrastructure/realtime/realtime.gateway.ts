import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Redis } from 'ioredis';
import type { Server } from 'socket.io';
import { TypedConfigService } from '@config/typed-config.service';
import { REDIS_PUB, REDIS_SUB } from '@infrastructure/redis/redis.constants';
import { BoardAccessService } from '@modules/members/services/board-access.service';
import type { AccessTokenPayload } from '@modules/auth/interfaces/token-payload.interface';
import { RealtimeService } from './realtime.service';
import { boardRoom } from './events.constants';
import type { AuthenticatedSocket } from './interfaces/socket-user.interface';

@WebSocketGateway({ namespace: '/ws', cors: { origin: true, credentials: true } })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);
  @WebSocketServer() private server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: TypedConfigService,
    private readonly access: BoardAccessService,
    private readonly realtime: RealtimeService,
    @Inject(REDIS_PUB) private readonly pub: Redis,
    @Inject(REDIS_SUB) private readonly sub: Redis,
  ) {}

  afterInit(server: Server): void {
    if (typeof (server as unknown as { adapter?: unknown }).adapter === 'function') {
      server.adapter(createAdapter(this.pub, this.sub));
      this.logger.log('Realtime gateway initialised with Redis adapter');
    } else {
      this.logger.warn('Socket.IO adapter API unavailable; skipping Redis adapter');
    }
    this.realtime.bindServer(server);
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      });
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
      this.logger.debug(`Socket connected: user=${payload.sub}`);
    } catch (err) {
      this.logger.debug(`Rejected socket: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('board:join')
  async joinBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { boardId: string },
  ): Promise<{ ok: true }> {
    if (!body?.boardId) throw new UnauthorizedException('boardId required');
    await this.access.requireMembership(body.boardId, client.data.user.id);
    await client.join(boardRoom(body.boardId));
    return { ok: true };
  }

  @SubscribeMessage('board:leave')
  async leaveBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { boardId: string },
  ): Promise<{ ok: true }> {
    await client.leave(boardRoom(body.boardId));
    return { ok: true };
  }

  @SubscribeMessage('presence:ping')
  presencePing(): { ok: true; ts: number } {
    return { ok: true, ts: Date.now() };
  }

  private extractToken(client: AuthenticatedSocket): string {
    const auth = client.handshake.auth as { token?: string } | undefined;
    if (auth?.token) return auth.token;
    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') return queryToken;
    throw new UnauthorizedException('Missing auth token');
  }
}
