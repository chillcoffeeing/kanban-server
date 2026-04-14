import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class FileKeyService {
  build(scope: string, originalName: string): string {
    const safe = this.sanitize(originalName);
    return `${scope}/${randomUUID()}-${safe}`;
  }

  private sanitize(name: string): string {
    return name
      .normalize('NFKD')
      .replace(/[^\w.\-]+/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 180);
  }
}
