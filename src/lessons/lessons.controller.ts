import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new lesson' })
    create(@Body() dto: CreateLessonDto) {
        return this.lessonsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all lessons, optionally filtered by sectionIds (comma-separated)' })
    @ApiQuery({ name: 'sectionIds', required: false })
    findAll(@Query('sectionIds') sectionIds?: string) {
        const ids = sectionIds ? sectionIds.split(',').filter(Boolean) : undefined;
        return this.lessonsService.findAll(ids);
    }

    @Get('section/:sectionId')
    @ApiOperation({ summary: 'Get all lessons for a section' })
    findBySection(@Param('sectionId') sectionId: string) {
        return this.lessonsService.findBySection(sectionId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get lesson by ID' })
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update lesson' })
    update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.lessonsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete lesson' })
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }

    @Post('reorder')
    @ApiOperation({ summary: 'Reorder lessons' })
    reorder(@Body() body: { sectionId: string; lessonIds: string[] }) {
        return this.lessonsService.reorder(body.sectionId, body.lessonIds);
    }

    @Patch('section/:sectionId/reorder')
    @ApiOperation({ summary: 'Reorder lessons by section ID' })
    reorderSectionLessons(
        @Param('sectionId') sectionId: string,
        @Body() body: { lessonIds?: string[]; lessonOrder?: { lessonId: string; order: number }[] },
    ) {
        const lessonIds = body.lessonIds || (body.lessonOrder ? body.lessonOrder.map((l) => l.lessonId) : []);
        return this.lessonsService.reorder(sectionId, lessonIds);
    }
}
