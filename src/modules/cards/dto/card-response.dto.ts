import { ApiProperty } from "@nestjs/swagger";
import type { Card, ChecklistItem, Label } from "@/generated/prisma/client";

export class CardResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() stageId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() position!: number;
  @ApiProperty({ nullable: true }) startDate!: Date | null;
  @ApiProperty({ nullable: true }) dueDate!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() members!: object[];
  @ApiProperty({ type: Object, isArray: true }) labels!: object[];
  @ApiProperty({ type: Object, isArray: true }) checklist!: object[];

  static fromEntity(
    c: Card & {
      members?: { userId: string; user: { name: string } }[];
      checklistItems?: ChecklistItem[];
      labels?: { label: Label }[];
    },
  ): CardResponseDto {
    return {
      id: c.id,
      stageId: c.stageId,
      title: c.title,
      description: c.description,
      position: c.position,
      startDate: c.startDate,
      dueDate: c.dueDate,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      members: c.members || [],
      labels: c.labels?.map((item) => item.label) ?? [],
      checklist: c.checklistItems ?? [],
    };
  }
}
