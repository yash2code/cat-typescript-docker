import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class UploadService {
    private s3: S3Client;
    private bucketName: string;

    constructor(configService: ConfigService) {
        this.s3 = new S3Client({
            region: configService.get<string>('app.awsRegion'),
            credentials: {
                accessKeyId: configService.get<string>('app.awsAccessKeyId'),
                secretAccessKey: configService.get<string>('app.awsSecretAccessKey'),
            },
        });

        this.bucketName = configService.get<string>('app.s3BucketName');
    }

    async getPresignedUrl(key: string): Promise<string> {
        const getCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const signedUrl = await getSignedUrl(this.s3, getCommand, {
            expiresIn: 3600, // URL valid for 1 hour
        });

        return signedUrl;
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `${Date.now()}-${file.originalname}`;

        const putCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Body: file.buffer,
            Key: key,
        });

        await this.s3.send(putCommand);

        return key;
    }

    async deleteFile(key: string): Promise<void> {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        await this.s3.send(deleteCommand);
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({ Bucket: this.bucketName, Key: key });
            await this.s3.send(command);
            return true;
        } catch (error) {
            console.log(error.code);

            if (error['$metadata'] && error['$metadata'].httpStatusCode === 404) {
                return false;
            }
            throw error;
        }
    }
}
