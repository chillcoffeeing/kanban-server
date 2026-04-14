import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { BoardRole, Invitation } from '@prisma/client';
import { UsersService } from '@modules/users/services/users.service';
import { MembersService } from '@modules/members/services/members.service';
import {
  IInvitationsRepository,
  INVITATIONS_REPOSITORY,
} from '../interfaces/invitations-repository.interface';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(INVITATIONS_REPOSITORY)
    private readonly repo: IInvitationsRepository,
    private readonly users: UsersService,
    private readonly members: MembersService,
  ) {}

  listByBoard(boardId: string): Promise<Invitation[]> {
    return this.repo.listByBoard(boardId);
  }

  async invite(
    boardId: string,
    email: string,
    role: BoardRole = 'member',
  ): Promise<Invitation> {
    if (role === 'owner') {
      throw new BadRequestException('Cannot invite as owner');
    }
    const existing = await this.repo.findPendingByEmail(boardId, email);
    if (existing) throw new ConflictException('Pending invitation already exists');
    return this.repo.create({
      boardId,
      email,
      role,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    });
  }

  async accept(token: string, userId: string): Promise<Invitation> {
    const invitation = await this.repo.findByToken(token);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation expired');
    }

    const user = await this.users.getById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new BadRequestException('Invitation email does not match current user');
    }

    await this.members.add(invitation.boardId, userId, invitation.role);
    await this.repo.markAccepted(invitation.id);
    return { ...invitation, acceptedAt: new Date() };
  }
}
