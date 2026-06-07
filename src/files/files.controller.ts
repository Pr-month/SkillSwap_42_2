import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { ImageInterceptor } from '../common/interceptors/image.interceptor';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(ImageInterceptor())
  upload(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Only image files are allowed');
    return { url: this.filesService.getFileUrl(file.filename) };
  }
}
