import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly uploadDir = join(__dirname, '../../public', 'uploads');

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  deleteFile(filename: string): void {
    const filePath = join(this.uploadDir, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  extractFilename(url: string): string {
    return url.split('/').pop() ?? '';
  }
}
