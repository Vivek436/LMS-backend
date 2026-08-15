import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { cloudinaryStorage } from '../config/cloudinary.config';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Create new lesson' })
    create(@Body() dto: CreateLessonDto) {
        return this.lessonsService.create(dto);
    }

    // Static POST routes must come before dynamic :id routes
    @Post('reorder')
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Reorder lessons' })
    reorder(@Body() body: { sectionId: string; lessonIds: string[] }) {
        return this.lessonsService.reorder(body.sectionId, body.lessonIds);
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
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Update lesson' })
    update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.lessonsService.update(id, dto);
    }

    @Post(':id/upload-video')
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Upload video file for a lesson' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here'
                ? cloudinaryStorage   // Cloudinary for video hosting
                : diskStorage({
                    destination: './uploads/videos',
                    filename: (_req, file, cb) => {
                        cb(null, `video-${uuidv4()}${extname(file.originalname)}`);
                    },
                }),
            fileFilter: (_req, file, cb) => {
                const allowed = /video\/(mp4|webm|ogg|quicktime)/;
                if (!allowed.test(file.mimetype)) {
                    return cb(new BadRequestException('Only MP4, WebM, OGG, or MOV video files are allowed'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
        }),
    )
    async uploadVideo(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No video file uploaded');
        }
        // Cloudinary: file.path = full CDN URL
        // diskStorage: file.filename = saved filename
        const isCloudinary = file.path && file.path.startsWith('http');
        const videoUrl = isCloudinary
            ? file.path
            : `/uploads/videos/${file.filename}`;

        const lesson = await this.lessonsService.update(id, { videoUrl });
        return { url: videoUrl, lesson };
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Delete lesson' })
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }

    @Patch('section/:sectionId/reorder')
    @UseGuards(RolesGuard)
    @Roles('admin', 'instructor')
    @ApiOperation({ summary: 'Reorder lessons by section ID' })
    reorderSectionLessons(
        @Param('sectionId') sectionId: string,
        @Body() body: { lessonIds?: string[]; lessonOrder?: { lessonId: string; order: number }[] },
    ) {
        const lessonIds = body.lessonIds || (body.lessonOrder ? body.lessonOrder.map((l) => l.lessonId) : []);
        return this.lessonsService.reorder(sectionId, lessonIds);
    }
}
