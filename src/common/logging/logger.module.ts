import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Env } from '@config/env.schema';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isDev = config.get('NODE_ENV', { infer: true }) === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            genReqId: (req: IncomingMessage) =>
              (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
            autoLogging: true,
            redact: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.currentPassword',
              'req.body.newPassword',
            ],
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'HH:MM:ss' },
                }
              : undefined,
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}
