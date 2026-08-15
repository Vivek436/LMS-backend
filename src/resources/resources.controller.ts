import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseInterceptors,
    UploadedFile,
    Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import { cloudinaryStorage } from '../config/cloudinary.config';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all resources' })
    findAll() {
        return this.resourcesService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Create new resource' })
    create(@Body() dto: CreateResourceDto) {
        return this.resourcesService.create(dto);
    }

    @Post('upload')
    @ApiOperation({ summary: 'Upload file' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here'
                ? cloudinaryStorage
                : diskStorage({
                    destination: './uploads',
                    filename: (req, file, cb) => {
                        const randomName = Array(32)
                            .fill(null)
                            .map(() => Math.round(Math.random() * 16).toString(16))
                            .join('');
                        cb(null, `${randomName}${extname(file.originalname)}`);
                    },
                }),
            limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
       

        if (!file) {
            console.error('❌ No file received');
            throw new Error('No file uploaded');
        }

        // Check if using Cloudinary
        const isCloudinary = file.path && file.path.includes('cloudinary');

        const result = {
            url: isCloudinary ? file.path : `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
        };


        return result;
    }

    @Get('lesson/:lessonId')
    @ApiOperation({ summary: 'Get all resources for a lesson' })
    findByLesson(@Param('lessonId') lessonId: string) {
        return this.resourcesService.findByLesson(lessonId);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download resource file' })
    async downloadFile(@Param('id') id: string, @Res() res: Response) {
        const resource = await this.resourcesService.findOne(id);

        if (!resource.url) {
            throw new Error('No file URL found');
        }

        // If it's a local file
        if (resource.url.startsWith('/uploads/')) {
            const filePath = join(__dirname, '..', '..', resource.url);
            res.download(filePath, resource.title);
        } else {
            // For external URLs, redirect
            res.redirect(resource.url);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resource by ID' })
    findOne(@Param('id') id: string) {
        return this.resourcesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update resource' })
    update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
        return this.resourcesService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete resource' })
    remove(@Param('id') id: string) {
        return this.resourcesService.remove(id);
    }
}
