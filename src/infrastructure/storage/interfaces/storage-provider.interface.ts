import type { Readable } from 'node:stream';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  mimeType: string;
  size: number;
}

export interface PutObjectResult {
  key: string;
  url: string;
}

export interface IStorageProvider {
  put(input: PutObjectInput): Promise<PutObjectResult>;
  get(key: string): Promise<Readable>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  isHealthy(): Promise<boolean>;
}
