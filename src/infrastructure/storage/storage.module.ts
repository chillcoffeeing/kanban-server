import { Global, Module } from '@nestjs/common';
import { TypedConfigService } from '@config/typed-config.service';
import { S3Provider } from './providers/s3.provider';
import { FileKeyService } from './services/file-key.service';
import { FileValidationService } from './services/file-validation.service';
import { StorageHealthIndicator } from './storage.health';
import { STORAGE_PROVIDER } from './storage.constants';

@Global()
@Module({
  providers: [
    TypedConfigService,
    FileKeyService,
    FileValidationService,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (config: TypedConfigService) => new S3Provider(config),
      inject: [TypedConfigService],
    },
    StorageHealthIndicator,
  ],
  exports: [
    STORAGE_PROVIDER,
    FileKeyService,
    FileValidationService,
    StorageHealthIndicator,
  ],
})
export class StorageModule {}
