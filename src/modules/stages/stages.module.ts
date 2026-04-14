import { Module } from '@nestjs/common';
import { StagesController } from './controllers/stages.controller';
import { StagesService } from './services/stages.service';
import { StagesRepository } from './services/stages.repository';
import { STAGES_REPOSITORY } from './interfaces/stages-repository.interface';

@Module({
  controllers: [StagesController],
  providers: [
    StagesService,
    { provide: STAGES_REPOSITORY, useClass: StagesRepository },
  ],
  exports: [StagesService],
})
export class StagesModule {}
