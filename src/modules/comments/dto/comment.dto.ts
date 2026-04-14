import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { Comment } from '@prisma/client';

export class CreateCommentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(5000)
  body!: string;
}

export class UpdateCommentDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(5000)
  body!: string;
}

export class CommentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() cardId!: string;
  @ApiProperty() authorId!: string;
  @ApiProperty() body!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(c: Comment): CommentResponseDto {
    return {
      id: c.id,
      cardId: c.cardId,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
