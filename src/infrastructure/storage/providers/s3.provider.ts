import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import type { Readable } from 'node:stream';
import { TypedConfigService } from '@config/typed-config.service';
import type {
  IStorageProvider,
  PutObjectInput,
  PutObjectResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class S3Provider implements IStorageProvider {
  private readonly logger = new Logger(S3Provider.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: TypedConfigService) {
    const endpoint = config.get('STORAGE_ENDPOINT');
    this.bucket = config.get('STORAGE_BUCKET');
    this.client = new S3Client({
      region: config.get('STORAGE_REGION'),
      endpoint: endpoint || undefined,
      forcePathStyle: config.get('STORAGE_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: config.get('STORAGE_ACCESS_KEY'),
        secretAccessKey: config.get('STORAGE_SECRET_KEY'),
      },
    });
    this.publicBaseUrl =
      config.get('STORAGE_PUBLIC_URL') ??
      (endpoint ? `${endpoint}/${this.bucket}` : `https://${this.bucket}.s3.amazonaws.com`);
  }

  async put(input: PutObjectInput): Promise<PutObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.mimeType,
        ContentLength: input.size,
      }),
    );
    return { key: input.key, url: this.getPublicUrl(input.key) };
  }

  async get(key: string): Promise<Readable> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return res.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch (err) {
      this.logger.warn(`Storage health check failed: ${(err as Error).message}`);
      return false;
    }
  }
}
