import type { Attachment } from '@prisma/client';

export interface CreateAttachmentData {
  cardId: string;
  name: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  uploadedBy: string;
}

export interface IAttachmentsRepository {
  findById(id: string): Promise<Attachment | null>;
  listByCard(cardId: string): Promise<Attachment[]>;
  create(data: CreateAttachmentData): Promise<Attachment>;
  delete(id: string): Promise<void>;
}

export const ATTACHMENTS_REPOSITORY = Symbol('ATTACHMENTS_REPOSITORY');
