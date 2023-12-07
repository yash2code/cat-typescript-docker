import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

class MetadataDto {
    @IsNumber()
    @Min(1)
    fileSize: number;

    @IsNotEmpty()
    @IsString()
    format: string;
}

export class CreateCatDto {
    @IsNotEmpty()
    @IsString()
    filename: string;

    @IsString()
    description?: string;

    @IsNotEmpty()
    metadata: MetadataDto;
}
