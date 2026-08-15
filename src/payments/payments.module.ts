import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity';
import { Course, CourseSchema } from '../courses/entities/course.entity';
import { Student, StudentSchema } from '../students/entities/student.entity';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Enrollment.name, schema: EnrollmentSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Student.name, schema: StudentSchema },
            { name: Instructor.name, schema: InstructorSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
