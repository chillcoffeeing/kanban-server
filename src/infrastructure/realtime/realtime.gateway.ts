import { Logger, UnauthorizedException } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server } from "socket.io";
import { TypedConfigService } from "@config/typed-config.service";
import { BoardAccessService } from "@modules/members/services/board-access.service";
import type { AccessTokenPayload } from "@modules/auth/interfaces/token-payload.interface";
import { boardRoom } from "./events.constants";
import type { AuthenticatedSocket } from "./interfaces/socket-user.interface";

interface JoinBoardDto {
  boardId: string;
}

interface EmitResult {
  ok: boolean;
}

@WebSocketGateway({
  cors: { origin: "*" },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log("RealtimeGateway initialized");
  }

  constructor(
    private readonly jwt: JwtService,
    private readonly config: TypedConfigService,
    private readonly access: BoardAccessService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.getJwtSecret(),
      });
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
      };
    } catch {
      this.logger.warn("Unauthorized connection attempt");
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {}

  @SubscribeMessage("board:join")
  async joinBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinBoardDto,
  ): Promise<EmitResult> {
    if (!body?.boardId) {
      throw new UnauthorizedException("boardId required");
    }
    await this.access.requireMembership(body.boardId, client.data.user.id);
    await client.join(boardRoom(body.boardId));
    return { ok: true };
  }

  @SubscribeMessage("board:leave")
  async leaveBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinBoardDto,
  ): Promise<EmitResult> {
    await client.leave(boardRoom(body.boardId));
    return { ok: true };
  }

  @SubscribeMessage("presence:ping")
  presencePing(): { ok: true; ts: number } {
    return { ok: true, ts: Date.now() };
  }

  private extractToken(client: AuthenticatedSocket): string {
    const auth = client.handshake.auth as { token?: string } | undefined;
    if (auth?.token) return auth.token;

    const header = client.handshake.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);

    const queryToken = client.handshake.query.token;
    if (typeof queryToken === "string") return queryToken;

    throw new UnauthorizedException("Missing auth token");
  }

  private getJwtSecret(): string {
    return (
      process.env.JWT_ACCESS_SECRET || this.config.get("JWT_ACCESS_SECRET")
    );
  }
}
