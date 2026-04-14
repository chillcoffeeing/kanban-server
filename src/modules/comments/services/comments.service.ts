import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Comment } from '@prisma/client';
import {
  COMMENTS_REPOSITORY,
  ICommentsRepository,
} from '../interfaces/comments-repository.interface';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY) private readonly repo: ICommentsRepository,
  ) {}

  listByCard(cardId: string): Promise<Comment[]> {
    return this.repo.listByCard(cardId);
  }

  create(cardId: string, authorId: string, body: string): Promise<Comment> {
    return this.repo.create({ cardId, authorId, body });
  }

  async getById(id: string): Promise<Comment> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Comment not found');
    return c;
  }

  async update(id: string, authorId: string, body: string): Promise<Comment> {
    const c = await this.getById(id);
    if (c.authorId !== authorId) {
      throw new ForbiddenException('Only the author can edit this comment');
    }
    return this.repo.update(id, body);
  }

  async delete(id: string, authorId: string, isBoardOwner: boolean): Promise<void> {
    const c = await this.getById(id);
    if (c.authorId !== authorId && !isBoardOwner) {
      throw new ForbiddenException('Cannot delete this comment');
    }
    await this.repo.delete(id);
  }
}
