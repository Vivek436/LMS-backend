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
  Request,
} from "@nestjs/common";
import { GetCoursesQueryDto } from "./dto/course.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CoursesService } from "./courses.service";
import {
  CreateCourseDto,
  UpdateCourseDto,
  PublishCourseDto,
} from "./dto/course.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CourseStatus } from "./entities/course.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { OwnershipGuard } from "../auth/guards/ownership.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CheckOwnership } from "../common/decorators/check-ownership.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Courses")
@Controller("courses")
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can access
  @ApiOperation({ summary: "Admin dashboard stats" })
  @ApiResponse({ status: 200, description: "Stats retrieved successfully" })
  async getAdminStats() {
    return this.coursesService.getAdminStats();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor') // Only admin and instructors can create
  @ApiOperation({ summary: "Create new course" })
  @ApiResponse({ status: 201, description: "Course created successfully" })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    // Auto-assign instructorId if instructor is creating
    // Use toString() to ensure we store a consistent type
    if (user?.role === 'instructor' && !dto.instructorId) {
      dto.instructorId = user._id?.toString() || user._id;
    }
    return this.coursesService.create(dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get all courses with filters and pagination" })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({
    name: "level",
    required: false,
    enum: ["beginner", "intermediate", "advanced"],
  })
  @ApiQuery({ name: "status", required: false, enum: CourseStatus })
  @ApiQuery({ name: "instructorId", required: false })
  findAll(@Query() query: GetCoursesQueryDto, @CurrentUser() user: any) {
    // Auto-filter by instructor if user is instructor
    if (user?.role === 'instructor' && !query.instructorId) {
      query.instructorId = user._id;
    }
    return this.coursesService.findAll(query);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: "Course statistics for dashboard" })
  getStats(@CurrentUser() user: any) {
    return this.coursesService.getStats(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get single course by ID" })
  @ApiParam({ name: "id", type: "string", description: "Course MongoDB ID" })
  findOne(@Param("id") id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(":id/claim")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  @ApiOperation({ summary: "Instructor claims an unassigned course" })
  @ApiParam({ name: "id", type: "string" })
  claimCourse(@Param("id") id: string, @CurrentUser() user: any) {
    return this.coursesService.claimCourse(id, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('admin', 'instructor')
  @CheckOwnership('course') // Verify ownership
  @ApiOperation({ summary: "Update course" })
  @ApiParam({ name: "id", type: "string" })
  update(@Param("id") id: string, @Body() dto: UpdateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.update(id, dto, user);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('admin', 'instructor')
  @CheckOwnership('course')
  @ApiOperation({
    summary: "Change course status (publish/archive/draft)",
  })
  @ApiParam({ name: "id", type: "string" })
  changeStatus(@Param("id") id: string, @Body() dto: PublishCourseDto) {
    return this.coursesService.changeStatus(id, dto.status);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('admin', 'instructor')
  @CheckOwnership('course')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete course (only if no enrollments)",
  })
  @ApiParam({ name: "id", type: "string" })
  remove(@Param("id") id: string) {
    return this.coursesService.remove(id);
  }
}
