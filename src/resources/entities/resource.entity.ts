import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ResourceType {
    PDF = 'pdf',
    VIDEO = 'video',
    DOCUMENT = 'document',
    LINK = 'link',
    OTHER = 'other',
}

@Schema({ timestamps: true })
export class Resource extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    lessonId: Types.ObjectId;

    @Prop({ enum: ResourceType, required: true })
    type: ResourceType;

    @Prop({ required: true })
    url: string;

    @Prop()
    description?: string;

    @Prop()
    fileSize?: number; // in bytes

    @Prop()
    fileName?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
