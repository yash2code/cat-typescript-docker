import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cat } from './schemas/cats.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UploadService } from 'src/common/upload/upload.service';

describe('CatsService', () => {
  let service: CatsService;
  let uploadService: UploadService;
  let catModel: Model<Cat>;

  const mockUploadService = {
    uploadFile: jest.fn(),
    getPresignedUrl: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn(),
  };

  const mockCat = {
    _id: 'some-cat-id',
    filename: 'cat.jpg',
    imageUrl: 'image-url',
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockCatDocument = {
    ...mockCat,
    save: jest.fn().mockResolvedValue(mockCat)
  };

  const mockCatModel = {
    create: jest.fn().mockResolvedValue(mockCatDocument),
    new: jest.fn().mockResolvedValue(mockCat),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    constructor: jest.fn().mockImplementation(() => mockCatDocument),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
        {
          provide: getModelToken(Cat.name),
          useValue: mockCatModel,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    uploadService = module.get<UploadService>(UploadService);
    catModel = module.get<Model<Cat>>(getModelToken(Cat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadCatPicture', () => {
    it('should successfully upload a cat picture', async () => {
      const file = { originalname: 'test.jpg', size: 1000, mimetype: 'image/jpeg' } as Express.Multer.File;
      const description = 'A cute cat';
      const imageUrl = 'image.jpeg';

      mockUploadService.uploadFile.mockResolvedValue(imageUrl);

      const result = await service.uploadCatPicture(file, description);

      expect(result).toEqual(expect.objectContaining({
        _id: mockCat._id,
        filename: mockCat.filename,
        imageUrl: mockCat.imageUrl,
      }));
      expect(mockCatModel.create).toHaveBeenCalledWith({
        filename: file.originalname,
        metadata: {
          fileSize: file.size,
          format: 'jpeg',
        },
        description,
        imageUrl
      });
    });
  });

  describe('findOneById', () => {
    it('should return a cat if found', async () => {
      const catId = 'some-cat-id';
      mockCatModel.findById.mockResolvedValue(mockCat);
      mockUploadService.getPresignedUrl.mockResolvedValue('presigned-url');

      const cat = await service.findOneById(catId);

      expect(cat).toEqual(mockCat);
    });

    it('should return null if no cat found', async () => {
      const catId = 'some-cat-id';
      mockCatModel.findById.mockResolvedValue(null);

      const cat = await service.findOneById(catId);

      expect(cat).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      mockCatModel.find.mockResolvedValue([mockCat]);
      mockUploadService.getPresignedUrl.mockResolvedValue('presigned-url');

      const cats = await service.findAll();

      expect(cats).toEqual(expect.arrayContaining([expect.any(Object)]));
      expect(mockUploadService.getPresignedUrl).toHaveBeenCalled();
    });
  });

  describe('updateCat', () => {
    it('should throw NotFoundException if cat does not exist', async () => {
      const catId = 'non-existing-id';
      const execMock = jest.fn();

      mockCatModel.findById.mockReturnValue({ exec: execMock });
      execMock.mockResolvedValue(null);

      await expect(service.updateCat(catId, {})).rejects.toThrow(NotFoundException);
    });

    it('should update a cat', async () => {
      const catId = 'existing-id';
      const updateCatDto = { filename: 'Updated Name' };
      const existingCat = { ...mockCat, imageUrl: 'old-url' };
      const execMock = jest.fn();
      mockCatModel.findById.mockReturnValue({ exec: execMock });

      execMock.mockResolvedValue(existingCat);
      mockCatModel.findByIdAndUpdate.mockResolvedValue({
        ...existingCat,
        ...updateCatDto,
      });

      const updatedCat = await service.updateCat(catId, updateCatDto);

      expect(updatedCat).toEqual(expect.any(Object));
    });
  });

  describe('deleteCat', () => {
    it('should delete a cat', async () => {
      const catId = 'existing-id';
      mockCatModel.findById.mockResolvedValue(mockCat);

      await service.deleteCat(catId);

      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(mockCat.imageUrl);
      expect(mockCat.deleteOne).toHaveBeenCalled();
    });

    it('should not throw an error if cat does not exist', async () => {
      const catId = 'non-existing-id';
      mockCatModel.findById.mockResolvedValue(null);

      await expect(service.deleteCat(catId)).resolves.toBeUndefined();
    });
  });
});
