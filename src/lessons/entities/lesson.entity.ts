import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonType {
    VIDEO = 'video',
    DOCUMENT = 'document',
    QUIZ = 'quiz',
    TEXT = 'text',
    ASSIGNMENT = 'assignment',
}

// ── Quiz ──────────────────────────────────────────
export class QuizOption {
    @Prop({ required: true })
    text: string;

    @Prop({ default: false })
    isCorrect: boolean;
}

export class QuizQuestion {
    @Prop({ required: true })
    question: string;

    @Prop({ type: [{ text: String, isCorrect: Boolean }], default: [] })
    options: QuizOption[];

    @Prop()
    explanation?: string; // shown after answering
}

// ── Assignment ────────────────────────────────────
export class AssignmentConfig {
    @Prop()
    instructions?: string;

    @Prop()
    maxScore?: number; // e.g. 100

    @Prop()
    dueInDays?: number; // days from enrollment date

    @Prop({ default: false })
    allowFileUpload: boolean;

    @Prop({ default: true })
    allowTextSubmission: boolean;
}

// ── Main entity ───────────────────────────────────
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
    videoDuration?: number; // in minutes

    @Prop()
    content?: string; // text lesson content

    // Quiz fields
    @Prop({
        type: [{
            question: String,
            options: [{ text: String, isCorrect: Boolean }],
            explanation: String,
        }],
        default: [],
    })
    quizQuestions: QuizQuestion[];

    @Prop({ type: Number, default: 70 })
    passingScore: number; // percentage needed to pass quiz

    // Assignment fields
    @Prop({
        type: {
            instructions: String,
            maxScore: Number,
            dueInDays: Number,
            allowFileUpload: Boolean,
            allowTextSubmission: Boolean,
        },
        default: null,
    })
    assignmentConfig?: AssignmentConfig;

    @Prop({ required: true, default: 0 })
    order: number;

    @Prop({ default: true })
    isPublished: boolean;

    @Prop({ default: false })
    isFree: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
