import { Module } from '@nestjs/common';
import { CatsModule } from './models/cats/cats.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import appConfig from './config/app.config';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UploadModule } from './common/upload/upload.module';
import { AuthModule } from './models/auth/auth.module';
import { UserModule } from './models/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongoUri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CatsModule,
    UploadModule,
    UserModule],
})
export class AppModule { }
