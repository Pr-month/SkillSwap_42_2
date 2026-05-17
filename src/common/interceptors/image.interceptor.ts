import { BadRequestException, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp|svg/;

interface ImageInterceptorOptions {
  fieldName?: string;
  maxFileSize?: number;
}

export function ImageInterceptor(
  options: ImageInterceptorOptions = {},
): Type<NestInterceptor> {
  const { fieldName = 'file', maxFileSize = 5 * 1024 * 1024 } = options;

  return FileInterceptor(fieldName, {
    fileFilter: (_, file, cb) => {
      const ext = file.originalname.toLowerCase().split('.').pop() ?? '';
      const mime = file.mimetype.toLowerCase();

      if (!ALLOWED_IMAGE_TYPES.test(ext) || !mime.startsWith('image/')) {
        return cb(
          new BadRequestException('Only image files are allowed'),
          false,
        );
      }
      cb(null, true);
    },
    limits: { fileSize: maxFileSize },
  });
}
