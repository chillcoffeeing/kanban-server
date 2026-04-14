import { Module } from '@nestjs/common';
import { CardsModule } from '@modules/cards/cards.module';
import { AttachmentsController } from './controllers/attachments.controller';
import { AttachmentsService } from './services/attachments.service';
import { AttachmentsRepository } from './services/attachments.repository';
import { ATTACHMENTS_REPOSITORY } from './interfaces/attachments-repository.interface';

@Module({
  imports: [CardsModule],
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService,
    { provide: ATTACHMENTS_REPOSITORY, useClass: AttachmentsRepository },
  ],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
