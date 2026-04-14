import { Module } from '@nestjs/common';
import { BoardsController } from './controllers/boards.controller';
import { BoardsService } from './services/boards.service';
import { BoardsRepository } from './services/boards.repository';
import { BOARDS_REPOSITORY } from './interfaces/boards-repository.interface';
import { StagesModule } from '@modules/stages/stages.module';
import { CardsModule } from '@modules/cards/cards.module';
import { MembersModule } from '@modules/members/members.module';

@Module({
  imports: [StagesModule, CardsModule, MembersModule],
  controllers: [BoardsController],
  providers: [
    BoardsService,
    { provide: BOARDS_REPOSITORY, useClass: BoardsRepository },
  ],
  exports: [BoardsService],
})
export class BoardsModule {}
