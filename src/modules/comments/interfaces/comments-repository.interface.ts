import type { Comment } from '@/generated/prisma/client';

export interface ICommentsRepository {
  findById(id: string): Promise<Comment | null>;
  listByCard(cardId: string): Promise<Comment[]>;
  create(data: {
    cardId: string;
    authorId: string;  // Now represents BoardMembership ID
    body: string;
  }): Promise<Comment>;
  update(id: string, body: string): Promise<Comment>;
  delete(id: string): Promise<void>;
}

export const COMMENTS_REPOSITORY = Symbol('COMMENTS_REPOSITORY');
