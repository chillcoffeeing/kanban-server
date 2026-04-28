import { Injectable } from '@nestjs/common';
import type { Invitation } from '@/generated/prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type {
  CreateInvitationData,
  IInvitationsRepository,
} from '../interfaces/invitations-repository.interface';

@Injectable()
export class InvitationsRepository implements IInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByToken(token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({ where: { token } });
  }

  findPendingByEmail(boardId: string, email: string): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: {
        boardId,
        email: email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  listByBoard(boardId: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateInvitationData): Promise<Invitation> {
    return this.prisma.invitation.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  async markAccepted(id: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  findPendingByUserEmail(email: string): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: {
        email: email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { board: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reject(id: string): Promise<void> {
    await this.prisma.invitation.delete({ where: { id } });
  }
}
