import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { InvitationsController } from './controllers/invitations.controller';
import { InvitationsService } from './services/invitations.service';
import { InvitationsRepository } from './services/invitations.repository';
import { INVITATIONS_REPOSITORY } from './interfaces/invitations-repository.interface';

@Module({
  imports: [UsersModule],
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    { provide: INVITATIONS_REPOSITORY, useClass: InvitationsRepository },
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
