import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { BoardRole } from '@/generated/prisma/client';
import {
  IMembersRepository,
  MEMBERS_REPOSITORY,
} from '../interfaces/members-repository.interface';
import { DEFAULT_MEMBER_PERMISSIONS, type BoardPermission } from '@shared/board-permissions';
import { DOMAIN_EVENTS } from '@shared/events/domain.events';

@Injectable()
export class MembersService {
  constructor(
    @Inject(MEMBERS_REPOSITORY) private readonly repo: IMembersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  listByBoard(boardId: string): Promise<any[]> {
    return this.repo.listByBoard(boardId);
  }

  listBoardIdsForUser(userId: string): Promise<{ boardId: string; role: string }[]> {
    return this.repo.listBoardIdsForUser(userId);
  }

  async add(
    boardId: string,
    userId: string,
    role: BoardRole,
    permissions: BoardPermission[] = DEFAULT_MEMBER_PERMISSIONS,
  ): Promise<any> {
    const existing = await this.repo.findByUserAndBoard(boardId, userId);
    if (existing) throw new ConflictException('User is already a member');
    const raw: any = await this.repo.create({ boardId, userId, role, permissions });
    const member = raw;
    const memberName = (member as any).user?.name ?? '';
    this.eventEmitter.emit(DOMAIN_EVENTS.MEMBER_JOINED, {
      boardId,
      data: { ...member, boardId },
      membershipId: member.id,
      userName: memberName,
      memberName,
    });
    return member;
  }

  async updateById(
    id: string,
    data: { role?: BoardRole; permissions?: string[] },
  ): Promise<any> {
    const membership = await this.repo.findById(id);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner' && data.role && data.role !== 'owner') {
      throw new BadRequestException('Cannot demote the board owner');
    }
    return this.repo.updateById(id, data);
  }

  async addPermission(membershipId: string, permission: string): Promise<void> {
    const membership = await this.repo.findById(membershipId);
    if (!membership) throw new NotFoundException("Member not found");
    if (membership.role === "owner") return;
    const perms = membership.permissions.includes(permission)
      ? membership.permissions
      : [...membership.permissions, permission];
    await this.repo.updateById(membershipId, { permissions: perms });
  }

  async findByUserAndBoard(boardId: string, userId: string): Promise<any> {
    return this.repo.findByUserAndBoard(boardId, userId);
  }

  async removeById(id: string): Promise<void> {
    const membership = await this.repo.findById(id);
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'owner') {
      throw new BadRequestException('Cannot remove the board owner');
    }
    await this.repo.deleteById(id);
  }
}
