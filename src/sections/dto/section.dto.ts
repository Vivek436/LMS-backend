import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty({ example: 'Introduction to React' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Learn the basics of React' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Course MongoDB ID' })
    @IsNotEmpty()
    @IsMongoId()
    courseId: string;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    order?: number;
}

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}
