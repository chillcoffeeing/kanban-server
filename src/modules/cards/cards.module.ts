import { Module } from '@nestjs/common';
import { StagesModule } from '@modules/stages/stages.module';
import { CardsController } from './controllers/cards.controller';
import { CardsService } from './services/cards.service';
import { CardsRepository } from './services/cards.repository';
import { CARDS_REPOSITORY } from './interfaces/cards.tokens';

@Module({
  imports: [StagesModule],
  controllers: [CardsController],
  providers: [
    CardsService,
    { provide: CARDS_REPOSITORY, useClass: CardsRepository },
  ],
  exports: [CardsService],
})
export class CardsModule {}
