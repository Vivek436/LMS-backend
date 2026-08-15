import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonProgressStatus {
    NOT_STARTED = 'not-started',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class LessonProgress extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
    studentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    lessonId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Enrollment', required: true })
    enrollmentId: Types.ObjectId;

    @Prop({ type: String, enum: LessonProgressStatus, default: LessonProgressStatus.IN_PROGRESS })
    status: LessonProgressStatus;

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop({ default: 0 })
    watchedDuration: number; // in seconds

    @Prop()
    completedAt?: Date;
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);

// Compound index for unique student-lesson combination
LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
