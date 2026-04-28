import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardRole, type Invitation } from '@/generated/prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty() @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: BoardRole, default: BoardRole.member })
  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole;
}

export class InvitationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() boardId!: string;
  @ApiProperty() boardName?: string;
  @ApiProperty() email!: string;
  @ApiProperty() role!: BoardRole;
  @ApiProperty() expiresAt!: Date;
  @ApiProperty({ nullable: true }) acceptedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ description: 'Only returned on creation' }) token?: string;

  static fromEntity(i: any, includeToken = false): InvitationResponseDto {
    const dto: InvitationResponseDto = {
      id: i.id,
      boardId: i.boardId,
      boardName: i.board?.name,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      acceptedAt: i.acceptedAt,
      createdAt: i.createdAt,
    };
    if (includeToken) dto.token = i.token;
    return dto;
  }
}
