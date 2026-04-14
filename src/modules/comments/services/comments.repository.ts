import { Injectable } from '@nestjs/common';
import type { Comment } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type { ICommentsRepository } from '../interfaces/comments-repository.interface';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  listByCard(cardId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: {
    cardId: string;
    authorId: string;
    body: string;
  }): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  update(id: string, body: string): Promise<Comment> {
    return this.prisma.comment.update({ where: { id }, data: { body } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
