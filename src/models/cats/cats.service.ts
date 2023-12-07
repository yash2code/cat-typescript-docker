import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UploadService } from 'src/common/upload/upload.service';
import { Cat } from './schemas/cats.schema';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
    constructor(
        private readonly uploadService: UploadService,
        @InjectModel(Cat.name) private readonly catModel: Model<Cat>
    ) { }

    async uploadCatPicture(file: Express.Multer.File, description?: string): Promise<Cat> {
        const imageUrl = await this.uploadService.uploadFile(file);

        const newCat = this.catModel.create({
            filename: file.originalname,
            metadata: {
                fileSize: file.size,
                format: file.mimetype.split('/')[1]
            },
            description,
            imageUrl
        });

        // await newCat.save();

        return newCat;
    }

    async findOneById(catId: string): Promise<Cat> {
        const cat = await this.catModel.findById(catId);
        if (cat) {
            cat.imageUrl = await this.uploadService.getPresignedUrl(cat.imageUrl);
        }
        return cat;
    }

    async findAll(): Promise<Cat[]> {
        const cats = await this.catModel.find();
        for (let cat of cats) {
            cat.imageUrl = await this.uploadService.getPresignedUrl(cat.imageUrl);
        }
        return cats;
    }


    async updateCat(catId: string, updateCatDto: UpdateCatDto, newImage?: Express.Multer.File): Promise<Cat> {
        const existingCat = await this.findCatById(catId);
        if (!existingCat) {
            throw new NotFoundException('Cat not found');
        }
        const key = existingCat.imageUrl
        if (newImage) {
            if (!await this.uploadService.fileExists(key)) {
                throw new BadRequestException('The provided image URL does not correspond to an existing file.');
            }

            await this.uploadService.deleteFile(key);

            const newKey = await this.uploadService.uploadFile(newImage);
            updateCatDto.imageUrl = newKey;
            updateCatDto.metadata = {
                fileSize: newImage.size,
                format: newImage.mimetype.split('/')[1]
            }
        }
        const updatedCat = await this.catModel.findByIdAndUpdate(catId, updateCatDto, { new: true });
        return updatedCat;
    }

    async deleteCat(catId: string): Promise<void> {
        const cat = await this.catModel.findById(catId);
        if (cat) {
            await this.uploadService.deleteFile(cat.imageUrl);

            await cat.deleteOne()
        }
    }

    async findCatById(catId: string): Promise<Cat> {
        const cat = await this.catModel.findById(catId).exec();
        if (!cat) {
            throw new NotFoundException(`Cat with ID ${catId} not found`);
        }
        return cat;
    }
}
