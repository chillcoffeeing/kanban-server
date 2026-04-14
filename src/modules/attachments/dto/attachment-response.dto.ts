import { ApiProperty } from '@nestjs/swagger';
import type { Attachment } from '@prisma/client';

export class AttachmentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() cardId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() size!: number;
  @ApiProperty() url!: string;
  @ApiProperty() uploadedBy!: string;
  @ApiProperty() uploadedAt!: Date;

  static fromEntity(a: Attachment): AttachmentResponseDto {
    return {
      id: a.id,
      cardId: a.cardId,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size,
      url: a.url,
      uploadedBy: a.uploadedBy,
      uploadedAt: a.uploadedAt,
    };
  }
}
