import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonType {
    VIDEO = 'video',
    DOCUMENT = 'document',
    QUIZ = 'quiz',
    TEXT = 'text',
}

@Schema({ timestamps: true })
export class Lesson extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
    sectionId: Types.ObjectId;

    @Prop({ enum: LessonType, default: LessonType.VIDEO })
    type: LessonType;

    @Prop()
    videoUrl?: string;

    @Prop()
    videoDuration?: number; // in seconds

    @Prop()
    content?: string; // For text lessons

    @Prop({ required: true, default: 0 })
    order: number;

    @Prop({ default: true })
    isPublished: boolean;

    @Prop({ default: false })
    isFree: boolean; // Preview lessons
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
