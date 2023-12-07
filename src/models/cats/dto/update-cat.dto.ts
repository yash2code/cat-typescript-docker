import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCatDto {
    @IsString()
    filename?: string;

    @IsOptional()
    @IsString()
    description?: string;
    metadata?: { fileSize: number; format: string; };

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
