import { registerAs } from '@nestjs/config';

export interface AppConfig {
    mongoUri: string;
    port: number;
}

export default registerAs('app', () => ({
    mongoUri: process.env.MONGO_URI,
    port: parseInt(process.env.PORT, 10) || 3000,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME,
}));
