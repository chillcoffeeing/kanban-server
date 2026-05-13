import { addDays, isPast } from 'date-fns';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { BoardRole, Invitation } from '@/generated/prisma/client';
import { UsersService } from '@modules/users/services/users.service';
import { MembersService } from '@modules/members/services/members.service';
import { BoardsService } from '@modules/boards/services/boards.service';
import { EmailService } from '@infrastructure/email/email.service';
import {
  IInvitationsRepository,
  INVITATIONS_REPOSITORY,
} from '../interfaces/invitations-repository.interface';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(INVITATIONS_REPOSITORY)
    private readonly repo: IInvitationsRepository,
    private readonly users: UsersService,
    private readonly members: MembersService,
    private readonly boards: BoardsService,
    private readonly email: EmailService,
  ) {}

  listByBoard(boardId: string): Promise<Invitation[]> {
    return this.repo.listByBoard(boardId);
  }

  async invite(
    boardId: string,
    email: string,
    inviterName: string,
    role: BoardRole = 'member',
  ): Promise<Invitation> {
    if (role === 'owner') {
      throw new BadRequestException('Cannot invite as owner');
    }
    const existing = await this.repo.findPendingByEmail(boardId, email);
    if (existing) throw new ConflictException('Pending invitation already exists');

    const board = await this.boards.getById(boardId);
    const token = randomBytes(32).toString('hex');
    const invitation = await this.repo.create({
      boardId,
      email,
      role,
      token,
      expiresAt: addDays(new Date(), 7),
    });

    const acceptUrl = `${process.env.APP_URL || 'http://localhost:5173'}/invite/${token}`;
    await this.email.sendInvitationEmail(email, board.name, inviterName, acceptUrl);

    return invitation;
  }

  async accept(token: string, userId: string): Promise<Invitation> {
    const invitation = await this.repo.findByToken(token);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }
    if (isPast(invitation.expiresAt)) {
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

  async acceptByTokenOnly(token: string, userId: string): Promise<Invitation> {
    const invitation = await this.repo.findByToken(token);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }
    if (isPast(invitation.expiresAt)) {
      throw new BadRequestException('Invitation expired');
    }

    await this.members.add(invitation.boardId, userId, invitation.role);
    await this.repo.markAccepted(invitation.id);
    return { ...invitation, acceptedAt: new Date() };
  }

  async getPendingForUser(email: string) {
    return this.repo.findPendingByUserEmail(email);
  }

  async rejectInvitation(id: string, userId: string) {
    const user = await this.users.getById(userId);
    await this.repo.reject(id);
    return { ok: true };
  }
}
