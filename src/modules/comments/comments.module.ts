import { Module } from '@nestjs/common';
import { CardsModule } from '@modules/cards/cards.module';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { CommentsRepository } from './services/comments.repository';
import { COMMENTS_REPOSITORY } from './interfaces/comments-repository.interface';

@Module({
  imports: [CardsModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    { provide: COMMENTS_REPOSITORY, useClass: CommentsRepository },
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
