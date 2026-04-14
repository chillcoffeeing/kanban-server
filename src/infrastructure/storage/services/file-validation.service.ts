import {
  Injectable,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { TypedConfigService } from '@config/typed-config.service';
import type { UploadedFile } from '../dto/uploaded-file.dto';

@Injectable()
export class FileValidationService {
  private readonly maxBytes: number;
  private readonly allowedMime: Set<string>;

  constructor(config: TypedConfigService) {
    this.maxBytes = config.get('UPLOAD_MAX_BYTES');
    this.allowedMime = new Set(config.get('UPLOAD_ALLOWED_MIME'));
  }

  assertValid(file: UploadedFile): void {
    if (file.size > this.maxBytes) {
      throw new PayloadTooLargeException(
        `File exceeds ${this.maxBytes} bytes (got ${file.size}).`,
      );
    }
    if (!this.allowedMime.has(file.mimeType)) {
      throw new UnsupportedMediaTypeException(
        `Mime type '${file.mimeType}' not allowed.`,
      );
    }
  }
}
