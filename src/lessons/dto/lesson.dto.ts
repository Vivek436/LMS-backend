import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LessonType } from '../entities/lesson.entity';

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

    @ApiPropertyOptional({ example: 600 })
    @IsOptional()
    @IsNumber()
    videoDuration?: number;

    @ApiPropertyOptional({ example: 'Lesson content here...' })
    @IsOptional()
    @IsString()
    content?: string;

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
