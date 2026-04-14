import { Global, Module, type OnApplicationShutdown, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { TypedConfigService } from '@config/typed-config.service';
import { REDIS_PUB, REDIS_SUB } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUB,
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) =>
        new Redis(config.get('REDIS_URL'), { lazyConnect: false }),
    },
    {
      provide: REDIS_SUB,
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) =>
        new Redis(config.get('REDIS_URL'), { lazyConnect: false }),
    },
  ],
  exports: [REDIS_PUB, REDIS_SUB],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_PUB) private readonly pub: Redis,
    @Inject(REDIS_SUB) private readonly sub: Redis,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await Promise.allSettled([this.pub.quit(), this.sub.quit()]);
  }
}
