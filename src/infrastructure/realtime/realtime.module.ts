import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MembersModule } from '@modules/members/members.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Global()
@Module({
  imports: [JwtModule.register({}), MembersModule],
  providers: [RealtimeService, RealtimeGateway],
  exports: [RealtimeService],
})
export class RealtimeModule {}
