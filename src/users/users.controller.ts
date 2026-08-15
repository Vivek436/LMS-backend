import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { cloudinaryStorage, cloudinary } from '../config/cloudinary.config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        return {
            success: true,
            data: user,
        };
    }

    @Patch(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any,
    ) {
        // Check if user is updating their own profile or is admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            throw new BadRequestException('You can only update your own profile');
        }

        const updatedUser = await this.usersService.updateProfile(id, updateUserDto);
        return {
            success: true,
            data: updatedUser,
        };
    }

    @Post('upload-profile-image')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here'
                ? cloudinaryStorage   // Cloudinary when credentials are set
                : diskStorage({
                    destination: './uploads/profiles',
                    filename: (_req, file, cb) => {
                        cb(null, `profile-${uuidv4()}${extname(file.originalname)}`);
                    },
                }),
            fileFilter: (_req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Cloudinary returns file.path as the full CDN URL
        // diskStorage returns file.filename as the saved name
        const isCloudinary = file.path && file.path.startsWith('http');
        const url = isCloudinary
            ? file.path
            : `/uploads/profiles/${file.filename}`;

        return { url };
    }

    @Patch(':id/change-password')
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
        @Request() req: any,
    ) {
        // Check if user is changing their own password or is admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            throw new BadRequestException('You can only change your own password');
        }

        await this.usersService.changePassword(id, changePasswordDto);
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }

    @Get(':id/stats')
    async getUserStats(@Param('id') id: string, @Request() req: any) {
        // Check if user is getting their own stats or is admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            throw new BadRequestException('You can only view your own stats');
        }

        const stats = await this.usersService.getUserStats(id);
        return {
            success: true,
            data: stats,
        };
    }
}