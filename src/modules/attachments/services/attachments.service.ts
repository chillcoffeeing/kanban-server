import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Attachment } from '@prisma/client';
import { STORAGE_PROVIDER } from '@infrastructure/storage/storage.constants';
import type { IStorageProvider } from '@infrastructure/storage/interfaces/storage-provider.interface';
import { FileKeyService } from '@infrastructure/storage/services/file-key.service';
import { FileValidationService } from '@infrastructure/storage/services/file-validation.service';
import type { UploadedFile } from '@infrastructure/storage/dto/uploaded-file.dto';
import {
  ATTACHMENTS_REPOSITORY,
  IAttachmentsRepository,
} from '../interfaces/attachments-repository.interface';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @Inject(ATTACHMENTS_REPOSITORY) private readonly repo: IAttachmentsRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
    private readonly validation: FileValidationService,
    private readonly keyService: FileKeyService,
  ) {}

  listByCard(cardId: string): Promise<Attachment[]> {
    return this.repo.listByCard(cardId);
  }

  async getById(id: string): Promise<Attachment> {
    const a = await this.repo.findById(id);
    if (!a) throw new NotFoundException('Attachment not found');
    return a;
  }

  async upload(
    cardId: string,
    uploaderId: string,
    file: UploadedFile,
  ): Promise<Attachment> {
    this.validation.assertValid(file);

    const key = this.keyService.build(`cards/${cardId}`, file.originalName);
    const { url } = await this.storage.put({
      key,
      body: file.buffer,
      mimeType: file.mimeType,
      size: file.size,
    });

    try {
      return await this.repo.create({
        cardId,
        name: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storageKey: key,
        url,
        uploadedBy: uploaderId,
      });
    } catch (err) {
      await this.safeDelete(key);
      throw err;
    }
  }

  async delete(id: string): Promise<Attachment> {
    const att = await this.getById(id);
    await this.repo.delete(id);
    await this.safeDelete(att.storageKey);
    return att;
  }

  private async safeDelete(key: string): Promise<void> {
    try {
      await this.storage.delete(key);
    } catch (err) {
      this.logger.warn(
        `Failed to delete storage object '${key}': ${(err as Error).message}`,
      );
    }
  }
}
