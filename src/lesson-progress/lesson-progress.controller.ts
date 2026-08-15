import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LessonProgressService } from './lesson-progress.service';
import { CreateLessonProgressDto, UpdateLessonProgressDto } from './dto/lesson-progress.dto';
import { LessonProgressStatus } from './entities/lesson-progress.entity';

@ApiTags('Lesson Progress')
@Controller('lesson-progress')
export class LessonProgressController {
    constructor(private readonly lessonProgressService: LessonProgressService) { }

    @Post()
    @ApiOperation({ summary: 'Create lesson progress' })
    create(@Body() dto: CreateLessonProgressDto) {
        return this.lessonProgressService.create(dto);
    }

    @Get('enrollment/:enrollmentId')
    @ApiOperation({ summary: 'Get progress for enrollment' })
    findByEnrollment(@Param('enrollmentId') enrollmentId: string) {
        return this.lessonProgressService.findByEnrollment(enrollmentId);
    }

    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get progress for student' })
    findByStudent(@Param('studentId') studentId: string) {
        return this.lessonProgressService.findByStudent(studentId);
    }

    @Get('stats/:enrollmentId')
    @ApiOperation({ summary: 'Get progress stats' })
    getStats(@Param('enrollmentId') enrollmentId: string) {
        return this.lessonProgressService.getStats(enrollmentId);
    }

    @Get()
    @ApiOperation({ summary: 'Get progress by student and lesson' })
    findByStudentAndLesson(
        @Query('studentId') studentId: string,
        @Query('lessonId') lessonId: string,
    ) {
        return this.lessonProgressService.findByStudentAndLesson(studentId, lessonId);
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Mark lesson progress as complete' })
    markComplete(@Param('id') id: string) {
        return this.lessonProgressService.updateById(id, { status: LessonProgressStatus.COMPLETED });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update lesson progress by ID' })
    updateById(@Param('id') id: string, @Body() dto: UpdateLessonProgressDto) {
        return this.lessonProgressService.updateById(id, dto);
    }

    @Patch()
    @ApiOperation({ summary: 'Update lesson progress by student and lesson' })
    update(
        @Query('studentId') studentId: string,
        @Query('lessonId') lessonId: string,
        @Body() dto: UpdateLessonProgressDto,
    ) {
        return this.lessonProgressService.update(studentId, lessonId, dto);
    }
}
