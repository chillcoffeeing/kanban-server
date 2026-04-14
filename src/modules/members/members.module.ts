import { Global, Module } from '@nestjs/common';
import { MembersController } from './controllers/members.controller';
import { MembersService } from './services/members.service';
import { MembersRepository } from './services/members.repository';
import { BoardAccessService } from './services/board-access.service';
import { BoardPermissionGuard } from './guards/board-permission.guard';
import { MEMBERS_REPOSITORY } from './interfaces/members-repository.interface';

@Global()
@Module({
  controllers: [MembersController],
  providers: [
    MembersService,
    BoardAccessService,
    BoardPermissionGuard,
    { provide: MEMBERS_REPOSITORY, useClass: MembersRepository },
  ],
  exports: [MembersService, BoardAccessService, BoardPermissionGuard],
})
export class MembersModule {}
