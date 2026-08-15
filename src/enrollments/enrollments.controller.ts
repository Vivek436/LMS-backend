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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EnrollmentsService } from './enrollments.service';
import {
  CreateEnrollmentDto,
  UpdateProgressDto,
  SubmitReviewDto,
  UpdatePaymentDto,
  UpdateEnrollmentStatusDto,
  UpdateEnrollmentDto,
} from './dto/enrollment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Student ko course mein enroll karo' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  @ApiResponse({ status: 400, description: 'Course not published or student not active' })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Saare enrollments list karo (filters available)' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student MongoDB ID' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course MongoDB ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'dropped', 'suspended'] })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['pending', 'paid', 'refunded', 'failed'] })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.enrollmentsService.findAll({
      ...paginationDto,
      studentId,
      courseId,
      status,
      paymentStatus,
    });
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Overall enrollment statistics' })
  getStats() {
    return this.enrollmentsService.getOverallStats();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all enrollments for a specific student' })
  @ApiParam({ name: 'studentId', type: 'string', description: 'Student MongoDB ID' })
  getByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findAll({ studentId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID se ek enrollment dhundo' })
  @ApiParam({ name: 'id', type: 'string', description: 'Enrollment MongoDB ID' })
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Enrollment update karo (general update)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Enrollment MongoDB ID' })
  update(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, dto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Student ka course progress update karo' })
  @ApiParam({ name: 'id', type: 'string' })
  updateProgress(@Param('id') id: string, @Body() dto: UpdateProgressDto) {
    return this.enrollmentsService.updateProgress(id, dto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Student course ko rate aur review kare' })
  @ApiParam({ name: 'id', type: 'string' })
  submitReview(@Param('id') id: string, @Body() dto: SubmitReviewDto) {
    return this.enrollmentsService.submitReview(id, dto);
  }

  @Patch(':id/payment')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Payment status update karo' })
  @ApiParam({ name: 'id', type: 'string' })
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.enrollmentsService.updatePayment(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Enrollment status change karo (drop/suspend)' })
  @ApiParam({ name: 'id', type: 'string' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEnrollmentStatusDto) {
    return this.enrollmentsService.updateStatus(id, dto);
  }

  @Post(':id/certificate')
  @ApiOperation({ summary: 'Completion certificate issue karo' })
  @ApiParam({ name: 'id', type: 'string' })
  issueCertificate(@Param('id') id: string) {
    return this.enrollmentsService.issueCertificate(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enrollment record delete karo (admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
