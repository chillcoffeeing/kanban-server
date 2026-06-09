import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MembersModule } from "@modules/members/members.module";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { RealtimeListener } from "./realtime.listener";

@Module({
  imports: [JwtModule.register({}), MembersModule],
  providers: [RealtimeService, RealtimeGateway, RealtimeListener],
  exports: [RealtimeService, RealtimeGateway],
})
export class RealtimeModule {}
