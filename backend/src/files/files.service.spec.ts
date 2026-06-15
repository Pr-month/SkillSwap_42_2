import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import fs from 'fs';

describe('FilesService', () => {
  let service: FilesService;
  let unlinkSyncSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);

    unlinkSyncSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementationOnce((filename) => {
        console.log(filename);
      });
  });

  afterEach(() => jest.restoreAllMocks());

  const filename = 'image.img';
  const fullFilename = '/uploads/image.img';

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct filename', () => {
    expect(service.getFileUrl(filename)).toBe(fullFilename);
  });

  it('should correctly extract filename', () => {
    expect(service.extractFilename(fullFilename)).toBe(filename);
  });

  it('should delete file if it exists', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    service.deleteFile(filename);
    expect(unlinkSyncSpy).toHaveBeenCalled();
  });

  it('should not delete file if it does not exists', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    service.deleteFile(filename);
    expect(unlinkSyncSpy).not.toHaveBeenCalled();
  });
});
