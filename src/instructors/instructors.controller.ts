import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Instructors')
@Controller('instructors')
@ApiBearerAuth()
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Naya instructor create karo' })
  @ApiResponse({ status: 201, description: 'Instructor successfully created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Saare instructors list karo (pagination + search)' })
  @ApiResponse({ status: 200, description: 'Instructors list with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.instructorsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'ID se ek instructor dhundo' })
  @ApiParam({ name: 'id', type: 'string', description: 'Instructor MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Instructor found' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Instructor ki details update karo' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Instructor updated' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  update(@Param('id') id: string, @Body() dto: UpdateInstructorDto) {
    return this.instructorsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Instructor ko inactive karo (soft delete)' })
  @ApiParam({ name: 'id', type: 'string' })
  deactivate(@Param('id') id: string) {
    return this.instructorsService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Instructor permanently delete karo' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Instructor deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete - has active courses' })
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }
}
