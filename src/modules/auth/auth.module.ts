import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@modules/users/users.module';
import { MembersModule } from '@modules/members/members.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { TypedConfigService } from '@config/typed-config.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { RefreshTokenRepository } from './services/refresh-token.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { REFRESH_TOKEN_REPOSITORY } from './interfaces/refresh-token-repository.interface';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
    MembersModule,
    InvitationsModule,
  ],
  controllers: [AuthController],
  providers: [
    TypedConfigService,
    AuthService,
    PasswordHasherService,
    TokenService,
    JwtStrategy,
    JwtAuthGuard,
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenRepository },
  ],
  exports: [AuthService, PasswordHasherService, JwtAuthGuard],
})
export class AuthModule {}
