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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { StudentsService } from "./students.service";
import {
  CreateStudentDto,
  GetStudentsQueryDto,
  UpdateStudentDto,
} from "./dto/student.dto";
import { PaginationDto } from "../common/dto/pagination.dto";

@ApiTags("Students")
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Post()
  @ApiOperation({ summary: "Naya student register karo" })
  @ApiResponse({ status: 201, description: "Student registered successfully" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Saare students list karo (pagination + filters)" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["active", "inactive", "suspended"],
  })
  @ApiQuery({ name: "city", required: false })
  @ApiQuery({ name: "role", required: false, enum: ["student", "instructor", "admin"] })
  findAll(@Query() query: GetStudentsQueryDto & { role?: string }) {
    return this.studentsService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "ID se ek student dhundo (enrollments ke saath)" })
  @ApiParam({ name: "id", type: "string" })
  findOne(@Param("id") id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Student ka dashboard stats" })
  @ApiParam({ name: "id", type: "string" })
  getStats(@Param("id") id: string) {
    return this.studentsService.getStudentStats(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Student ki profile update karo" })
  @ApiParam({ name: "id", type: "string" })
  update(@Param("id") id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Patch(":id/suspend")
  @ApiOperation({ summary: "Student account suspend karo" })
  @ApiParam({ name: "id", type: "string" })
  suspend(@Param("id") id: string) {
    return this.studentsService.suspend(id);
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Student account activate karo" })
  @ApiParam({ name: "id", type: "string" })
  activate(@Param("id") id: string) {
    return this.studentsService.activate(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Student delete karo" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete - has active enrollments",
  })
  remove(@Param("id") id: string) {
    return this.studentsService.remove(id);
  }
}
