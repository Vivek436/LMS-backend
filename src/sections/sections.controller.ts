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
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new section' })
    create(@Body() dto: CreateSectionDto) {
        return this.sectionsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sections, optionally filtered by instructorId' })
    @ApiQuery({ name: 'instructorId', required: false })
    @ApiQuery({ name: 'courseId', required: false })
    findAll(@Query('instructorId') instructorId?: string, @Query('courseId') courseId?: string) {
        return this.sectionsService.findAll({ instructorId, courseId });
    }

    @Get('course/:courseId')
    @ApiOperation({ summary: 'Get all sections for a course' })
    findByCourse(@Param('courseId') courseId: string) {
        return this.sectionsService.findByCourse(courseId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get section by ID' })
    findOne(@Param('id') id: string) {
        return this.sectionsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update section' })
    update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
        return this.sectionsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete section' })
    remove(@Param('id') id: string) {
        return this.sectionsService.remove(id);
    }

    @Post('reorder')
    @ApiOperation({ summary: 'Reorder sections' })
    reorder(@Body() body: { courseId: string; sectionIds: string[] }) {
        return this.sectionsService.reorder(body.courseId, body.sectionIds);
    }

    @Patch('course/:courseId/reorder')
    @ApiOperation({ summary: 'Reorder sections by course ID' })
    reorderCourseSections(
        @Param('courseId') courseId: string,
        @Body() body: { sectionIds?: string[]; sectionOrder?: { sectionId: string; order: number }[] },
    ) {
        const sectionIds = body.sectionIds || (body.sectionOrder ? body.sectionOrder.map((s) => s.sectionId) : []);
        return this.sectionsService.reorder(courseId, sectionIds);
    }
}
