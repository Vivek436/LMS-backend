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
// import { ChangePasswordDto } from './dto/change-password.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        console.log('Getting user by ID:', id);
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
        console.log('Updating user:', id, updateUserDto);

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
            storage: diskStorage({
                destination: './uploads/profiles',
                filename: (req, file, cb) => {
                    const uniqueSuffix = uuidv4();
                    const ext = extname(file.originalname);
                    cb(null, `profile-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
        console.log('Uploading profile image:', file?.filename);

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const imageUrl = `/uploads/profiles/${file.filename}`;
        return {
            success: true,
            data: { url: imageUrl },
        };
    }

    @Patch(':id/change-password')
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
        @Request() req: any,
    ) {
        console.log('Changing password for user:', id);

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
        console.log('Getting user stats for:', id);

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