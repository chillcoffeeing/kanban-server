import { Injectable } from '@nestjs/common';
import type { Attachment } from '@prisma/client';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import type {
  CreateAttachmentData,
  IAttachmentsRepository,
} from '../interfaces/attachments-repository.interface';

@Injectable()
export class AttachmentsRepository implements IAttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Attachment | null> {
    return this.prisma.attachment.findUnique({ where: { id } });
  }

  listByCard(cardId: string): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: { cardId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  create(data: CreateAttachmentData): Promise<Attachment> {
    return this.prisma.attachment.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({ where: { id } });
  }
}
