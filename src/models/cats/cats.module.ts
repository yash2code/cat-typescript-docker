import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './schemas/cats.schema';
import { UploadModule } from 'src/common/upload/upload.module';
import { CatsService } from './cats.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
        UploadModule,
        AuthModule
    ],
    controllers: [CatsController],
    providers: [CatsService],
})
export class CatsModule { }
