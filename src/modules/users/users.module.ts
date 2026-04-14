import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './services/users.repository';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
