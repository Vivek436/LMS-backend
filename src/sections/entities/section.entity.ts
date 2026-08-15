import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Section extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ required: true, default: 0 })
    order: number;

    @Prop({ default: true })
    isPublished: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
