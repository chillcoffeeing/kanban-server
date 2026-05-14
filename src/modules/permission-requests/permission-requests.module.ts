import { Module } from "@nestjs/common";
import { MembersModule } from "@modules/members/members.module";
import { PermissionRequestsController } from "./controllers/permission-requests.controller";
import { PermissionRequestsService } from "./services/permission-requests.service";
import { PermissionRequestsRepository } from "./services/permission-requests.repository";
import { PERMISSION_REQUESTS_REPOSITORY } from "./interfaces/permission-requests-repository.interface";

@Module({
  imports: [MembersModule],
  controllers: [PermissionRequestsController],
  providers: [
    PermissionRequestsService,
    { provide: PERMISSION_REQUESTS_REPOSITORY, useClass: PermissionRequestsRepository },
  ],
  exports: [PermissionRequestsService],
})
export class PermissionRequestsModule {}
