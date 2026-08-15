import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@ApiTags('Sections')
@Controller('sections')
@ApiBearerAuth()
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Create new section' })
    create(@Body() dto: CreateSectionDto) {
        return this.sectionsService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all sections, optionally filtered by instructorId' })
    @ApiQuery({ name: 'instructorId', required: false })
    @ApiQuery({ name: 'courseId', required: false })
    findAll(@Query('instructorId') instructorId?: string, @Query('courseId') courseId?: string) {
        return this.sectionsService.findAll({ instructorId, courseId });
    }

    @Get('course/:courseId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all sections for a course' })
    findByCourse(@Param('courseId') courseId: string) {
        return this.sectionsService.findByCourse(courseId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get section by ID' })
    findOne(@Param('id') id: string) {
        return this.sectionsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Update section' })
    update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
        return this.sectionsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Delete section' })
    remove(@Param('id') id: string) {
        return this.sectionsService.remove(id);
    }

    @Post('reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Reorder sections' })
    reorder(@Body() body: { courseId: string; sectionIds: string[] }) {
        return this.sectionsService.reorder(body.courseId, body.sectionIds);
    }

    @Patch('course/:courseId/reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Reorder sections by course ID' })
    reorderCourseSections(
        @Param('courseId') courseId: string,
        @Body() body: { sectionIds?: string[]; sectionOrder?: { sectionId: string; order: number }[] },
    ) {
        const sectionIds = body.sectionIds || (body.sectionOrder ? body.sectionOrder.map((s) => s.sectionId) : []);
        return this.sectionsService.reorder(courseId, sectionIds);
    }
}
