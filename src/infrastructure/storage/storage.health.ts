import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { STORAGE_PROVIDER } from './storage.constants';
import type { IStorageProvider } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {
    super();
  }

  async isHealthy(key = 'storage'): Promise<HealthIndicatorResult> {
    const ok = await this.storage.isHealthy();
    const result = this.getStatus(key, ok);
    if (ok) return result;
    throw new HealthCheckError('Storage unavailable', result);
  }
}
