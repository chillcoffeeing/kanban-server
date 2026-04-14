import { Module } from '@nestjs/common';
import { CardsModule } from '@modules/cards/cards.module';
import { LabelsController } from './controllers/labels.controller';
import { LabelsService } from './services/labels.service';
import { LabelsRepository } from './services/labels.repository';
import { LABELS_REPOSITORY } from './interfaces/labels-repository.interface';

@Module({
  imports: [CardsModule],
  controllers: [LabelsController],
  providers: [
    LabelsService,
    { provide: LABELS_REPOSITORY, useClass: LabelsRepository },
  ],
  exports: [LabelsService],
})
export class LabelsModule {}
