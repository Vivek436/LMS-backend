import { IsNotEmpty, IsString, IsEnum, IsMongoId, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ResourceType } from '../entities/resource.entity';

export class CreateResourceDto {
    @ApiProperty({ example: 'Course Notes PDF' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Lesson MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    lessonId: string;

    @ApiProperty({ enum: ResourceType })
    @IsNotEmpty()
    @IsEnum(ResourceType)
    type: ResourceType;

    @ApiProperty({ example: 'https://example.com/file.pdf' })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiPropertyOptional({ example: 'Brief description of the resource' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 1024000 })
    @IsOptional()
    @IsNumber()
    fileSize?: number;

    @ApiPropertyOptional({ example: 'notes.pdf' })
    @IsOptional()
    @IsString()
    fileName?: string;
}

export class UpdateResourceDto extends PartialType(CreateResourceDto) { }
