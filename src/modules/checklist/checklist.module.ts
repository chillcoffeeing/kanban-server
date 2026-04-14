import { Module } from '@nestjs/common';
import { CardsModule } from '@modules/cards/cards.module';
import { ChecklistController } from './controllers/checklist.controller';
import { ChecklistService } from './services/checklist.service';
import { ChecklistRepository } from './services/checklist.repository';
import { CHECKLIST_REPOSITORY } from './interfaces/checklist-repository.interface';

@Module({
  imports: [CardsModule],
  controllers: [ChecklistController],
  providers: [
    ChecklistService,
    { provide: CHECKLIST_REPOSITORY, useClass: ChecklistRepository },
  ],
  exports: [ChecklistService],
})
export class ChecklistModule {}
