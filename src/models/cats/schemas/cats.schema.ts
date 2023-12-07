import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Cat extends Document {
    @Prop({ required: true })
    filename: string;

    @Prop()
    description?: string;

    @Prop({ required: true, type: Number, min: 1 })
    'metadata.fileSize': number;

    @Prop({ required: true, type: String })
    'metadata.format': string;

    @Prop({ required: true })
    imageUrl: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
