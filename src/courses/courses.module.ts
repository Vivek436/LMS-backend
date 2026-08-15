import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './entities/course.entity';
import { Student, StudentSchema } from '../students/entities/student.entity';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity';
import { Section, SectionSchema } from '../sections/entities/section.entity';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { OwnershipGuard } from '../auth/guards/ownership.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
    ])
  ],
  controllers: [CoursesController],
  providers: [CoursesService, OwnershipGuard],
  exports: [CoursesService, OwnershipGuard],
})
export class CoursesModule { }
