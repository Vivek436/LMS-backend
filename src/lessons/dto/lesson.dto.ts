import {
    IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean,
    IsEnum, IsMongoId, IsNumber, IsArray, ValidateNested, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { LessonType } from '../entities/lesson.entity';

// ── Quiz DTOs ──────────────────────────────────────
export class QuizOptionDto {
    @ApiProperty({ example: 'Paris' })
    @IsString()
    text: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isCorrect?: boolean;
}

export class QuizQuestionDto {
    @ApiProperty({ example: 'What is the capital of France?' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ type: [QuizOptionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizOptionDto)
    options: QuizOptionDto[];

    @ApiPropertyOptional({ example: 'Paris is the capital of France.' })
    @IsOptional()
    @IsString()
    explanation?: string;
}

// ── Assignment config DTO ──────────────────────────
export class AssignmentConfigDto {
    @ApiPropertyOptional({ example: 'Write a 500-word essay on React hooks.' })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    maxScore?: number;

    @ApiPropertyOptional({ example: 7 })
    @IsOptional()
    @IsNumber()
    dueInDays?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    allowFileUpload?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    allowTextSubmission?: boolean;
}

// ── Main lesson DTO ────────────────────────────────
export class CreateLessonDto {
    @ApiProperty({ example: 'Introduction to Hooks' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Learn about React Hooks' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Section MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    sectionId: string;

    @ApiPropertyOptional({ enum: LessonType, default: LessonType.VIDEO })
    @IsOptional()
    @IsEnum(LessonType)
    type?: LessonType;

    @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({ example: 30 })
    @IsOptional()
    @IsNumber()
    videoDuration?: number;

    @ApiPropertyOptional({ example: 'Lesson content here...' })
    @IsOptional()
    @IsString()
    content?: string;

    // Quiz
    @ApiPropertyOptional({ type: [QuizQuestionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizQuestionDto)
    quizQuestions?: QuizQuestionDto[];

    @ApiPropertyOptional({ example: 70, description: 'Passing score percentage' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    passingScore?: number;

    // Assignment
    @ApiPropertyOptional({ type: AssignmentConfigDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => AssignmentConfigDto)
    assignmentConfig?: AssignmentConfigDto;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    order?: number;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isFree?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
