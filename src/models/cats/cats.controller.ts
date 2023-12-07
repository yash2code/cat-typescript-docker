import {
    Body, Controller,
    Get, Param, Post, Put,
    UploadedFile, UseInterceptors,
    Delete,
    BadRequestException,
    UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatsService } from './cats.service';
import { Cat } from './schemas/cats.schema';
import { UpdateCatDto } from './dto/update-cat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cats')
@UseGuards(JwtAuthGuard)
export class CatsController {
    constructor(private readonly catsService: CatsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCatPicture(
        @UploadedFile() file: Express.Multer.File,
        @Body('description') description: string
    ) {
        return await this.catsService.uploadCatPicture(file, description);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.catsService.findOneById(id);
    }

    @Get()
    async findAll() {
        return this.catsService.findAll();
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    async updateCat(
        @Param('id') catId: string,
        @Body() updateCatDto: UpdateCatDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<Cat> {
        if (updateCatDto.imageUrl && !file) {
            throw new BadRequestException('Provide image file or remove imageUrl from the body.');
        }
        return this.catsService.updateCat(catId, updateCatDto, file);
    }

    @Delete(':id')
    async deleteCat(@Param('id') catId: string): Promise<void> {
        return this.catsService.deleteCat(catId);
    }
}
